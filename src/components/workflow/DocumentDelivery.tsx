import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FolderOpen, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GoogleDriveService } from '@/services/googleDriveService';

interface DocumentDeliveryProps {
  onNext: (stepData?: any) => void;
  onPrev?: () => void;
  data: any;
  courseConfig?: any;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const DocumentDelivery = ({ onNext, onPrev, data, updateStepData, currentStepKey }: DocumentDeliveryProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [driveIntegration, setDriveIntegration] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load saved step data
    const stepData = data?.[currentStepKey || 'documentDelivery'];
    if (stepData) {
      setEmailSent(stepData.emailSent || false);
    }
  }, [data, currentStepKey]);

  useEffect(() => {
    // Auto-save when data changes
    if ((emailSent) && updateStepData && currentStepKey) {
      updateStepData(currentStepKey, {
        emailSent,
        documentsCount: documents.length,
        updatedAt: new Date().toISOString()
      });
    }
  }, [emailSent, documents.length, updateStepData, currentStepKey]);

  useEffect(() => {
    loadCompletedDocuments();
  }, []);

  const loadCompletedDocuments = async () => {
    try {
      setLoading(true);

      // Get user's generated documents
      const { data: userDocs, error: docsError } = await supabase
        .from('document_files')
        .select('*')
        .eq('user_id', user?.id)
        .in('document_type', ['generated_document', 'minister_certificate', 'barcode_certificate'])
        .order('upload_date', { ascending: false });

      if (docsError) throw docsError;

      // Get Google Drive info from verification step
      const verificationData = data?.['step_6'] || data?.verificationTools;
      const driveUrl = verificationData?.googleDriveUrl;

      if (driveUrl && userDocs) {
        const driveIntegration = await GoogleDriveService.prepareDocumentsForDrive(
          userDocs.map(doc => ({
            fileName: doc.file_name,
            fileUrl: doc.file_url,
            documentType: doc.document_type
          })),
          { driveUrl }
        );

        setDriveIntegration(driveIntegration);
      }

      setDocuments(userDocs || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error Loading Documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendDocumentEmail = async () => {
    try {
      if (!user?.email || !driveIntegration) return;

      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-completion-notification', {
        body: {
          to: user.email,
          userName: user.user_metadata?.full_name || 'Minister',
          documents: driveIntegration.downloadLinks,
          folderUrl: driveIntegration.folderUrl
        }
      });

      if (error) throw error;

      setEmailSent(true);
      
      toast({
        title: "Email Sent!",
        description: "Download links have been sent to your email address",
      });

    } catch (error: any) {
      console.error('Email error:', error);
      toast({
        title: "Email Error",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    }
  };

  const openGoogleDrive = () => {
    if (driveIntegration?.folderUrl) {
      window.open(driveIntegration.folderUrl, '_blank');
    }
  };

  const downloadAllDocuments = () => {
    // Download all documents one by one
    documents.forEach((doc, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = doc.file_url;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads by 500ms
    });

    toast({
      title: "Downloads Started",
      description: `Downloading ${documents.length} documents...`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Document Delivery & Google Drive Integration
          </CardTitle>
          <CardDescription>
            Your trust documents are ready! Download them and save to your Google Drive folder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">🎉 Congratulations!</div>
                <div className="text-sm text-green-600 mt-1">
                  Your trust documents have been generated and are ready for download. 
                  We'll help you save them directly to your Google Drive folder for safekeeping.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Generated Documents
            <Button onClick={downloadAllDocuments} disabled={documents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </CardTitle>
          <CardDescription>
            Download each document individually or get all download links via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading your documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found. Please complete the previous steps.
            </div>
          ) : (
            <div className="grid gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{doc.file_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.document_type.replace('_', ' ').toUpperCase()} • 
                      {new Date(doc.upload_date || doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.file_type}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Drive Integration */}
      {driveIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Save to Your Google Drive
            </CardTitle>
            <CardDescription>
              Automatically organize your documents in your Google Drive folder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="font-medium mb-2">Quick Save Instructions:</div>
              <ol className="text-sm space-y-1">
                <li>1. Click "Download All" above or download documents individually</li>
                <li>2. Click "Open Google Drive" below to open your folder</li>
                <li>3. Drag and drop the downloaded files into your Drive folder</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button onClick={openGoogleDrive} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Your Google Drive Folder
              </Button>
              
              <Button 
                variant="outline" 
                onClick={sendDocumentEmail}
                disabled={emailSent || !user?.email}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                {emailSent ? "Email Sent ✓" : "Email Me Download Links"}
              </Button>
            </div>

            {emailSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-700">
                  ✓ Download links have been sent to {user?.email}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Completion */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="text-xl font-semibold text-green-800">
              🎊 Course Complete!
            </div>
            <div className="text-green-600">
              You have successfully completed the trust creation process. 
              Your documents are legally valid and ready to use.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>
          Previous
        </Button>
        <Button 
          onClick={() => onNext({
            emailSent,
            documentsCount: documents.length,
            completedAt: new Date().toISOString()
          })}
          className="bg-green-600 hover:bg-green-700"
        >
          Complete Course
        </Button>
      </div>
    </div>
  );
};

export default DocumentDelivery;