import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, User, Mail, Upload, FileText, Hash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import { useAutoSave } from '@/hooks/useAutoSave';

interface StepDocumentSummaryProps {
  onNext: () => void;
  onPrev: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const StepDocumentSummary = ({ onNext, onPrev, data, onDataChange }: StepDocumentSummaryProps) => {
  const { user } = useAuth();
  const [allUserData, setAllUserData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Auto-save this step
  useAutoSave({ key: 'document_summary', data: allUserData });

  // Load all user progress data
  useEffect(() => {
    const loadAllUserData = async () => {
      if (!user) return;

      try {
        console.log('Loading all user data for summary...');
        
        // Get ALL user progress data
        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading progress data:', error);
          throw error;
        }

        console.log('Raw progress data:', progressData);

        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        }

        // Organize data by step keys
        const organizedData: any = {};
        progressData?.forEach(step => {
          console.log(`Step ${step.step_key}:`, step.step_data);
          organizedData[step.step_key] = step.step_data;
        });

        // Create comprehensive data structure with SINGLE SOURCE for each field
        const completeUserData = {
          // Profile information
          profile: profile,
          
          // SINGLE SOURCE: Personal Identity (from step_2 OR identity)
          personalInfo: organizedData.step_2 || organizedData.identity || {},
          
          // SINGLE SOURCE: Trust Information (from step_3)
          trustInfo: organizedData.step_3 || {},
          
          // SINGLE SOURCE: Business Information (from step_4) 
          businessInfo: organizedData.step_4 || {},
          
          // SINGLE SOURCE: Ordination (from step_5)
          ordinationInfo: organizedData.step_5 || {},
          
          // SINGLE SOURCE: Minister Verification (from step_6)
          ministerInfo: organizedData.step_6 || {},
          
          // SINGLE SOURCE: Verification Tools (from verification_tools OR step_verification_tools)
          verificationInfo: organizedData.verification_tools || organizedData.step_verification_tools || {},
          
          // SINGLE SOURCE: Document Summary (from document_summary)
          summaryInfo: organizedData.document_summary || {},
          
          // Raw data for debugging
          rawSteps: organizedData,
          
          // Completion status
          completionStatus: {
            personalComplete: !!(organizedData.step_2?.firstName || organizedData.identity?.firstName),
            trustComplete: !!(organizedData.step_3?.trustName),
            businessComplete: !!(organizedData.step_4?.businessName),
            ordinationComplete: !!(organizedData.step_5?.isOrdained),
            ministerComplete: !!(organizedData.step_6?.ministerCertificate),
            verificationComplete: !!(organizedData.verification_tools?.barcodeImage || organizedData.step_verification_tools?.barcodeImage)
          }
        };

        console.log('Organized complete user data:', completeUserData);
        
        setAllUserData(completeUserData);
        onDataChange(completeUserData);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadAllUserData();
  }, [user, onDataChange]);

  const renderDataSection = (title: string, icon: any, data: any, isComplete: boolean) => {
    const IconComponent = icon;
    
    return (
      <Card className={`${isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconComponent className="h-5 w-5" />
            {title}
            {isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600 ml-auto" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isComplete ? (
            <div className="space-y-2 text-sm">
              {Object.entries(data || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-gray-900 font-medium">
                    {typeof value === 'string' && value.length > 30 
                      ? `${value.substring(0, 30)}...` 
                      : String(value || 'Not provided')
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Information not completed</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
          <CardDescription>
            Review all collected information before generating your trust documents
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {renderDataSection(
          "Personal Identity", 
          User, 
          allUserData.personalInfo, 
          allUserData.completionStatus?.personalComplete || false
        )}
        
        {renderDataSection(
          "Trust Information", 
          FileText, 
          allUserData.trustInfo, 
          allUserData.completionStatus?.trustComplete || false
        )}
        
        {renderDataSection(
          "Business Information", 
          FileText, 
          allUserData.businessInfo, 
          allUserData.completionStatus?.businessComplete || false
        )}
        
        {renderDataSection(
          "Ordination Status", 
          Upload, 
          {
            ordained: allUserData.ordinationInfo?.isOrdained ? 'Yes' : 'No',
            certificate: allUserData.ordinationInfo?.certificateUploaded ? 'Uploaded' : 'Not uploaded',
            url: allUserData.ordinationInfo?.certificateUrl || 'Not provided'
          }, 
          allUserData.completionStatus?.ordinationComplete || false
        )}
        
        {renderDataSection(
          "Minister Verification", 
          Upload, 
          {
            certificate: allUserData.ministerInfo?.ministerCertificate || 'Not uploaded',
            verified: allUserData.ministerInfo?.verified ? 'Yes' : 'No'
          }, 
          allUserData.completionStatus?.ministerComplete || false
        )}
        
        {renderDataSection(
          "Document Verification", 
          Hash, 
          {
            barcodeCertificate: allUserData.verificationInfo?.barcodeCertificate || 'Not uploaded',
            barcodeImage: allUserData.verificationInfo?.barcodeImage || 'Not uploaded',
            gmailAddress: allUserData.verificationInfo?.gmailAddress || 'Not provided',
            googleDriveLink: allUserData.verificationInfo?.googleDriveLink ? 'Configured' : 'Not configured'
          }, 
          allUserData.completionStatus?.verificationComplete || false
        )}
      </div>

      {/* Debug Information - REMOVE AFTER TESTING */}
      <Card className="mt-4 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information (Remove After Testing)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(allUserData.rawSteps, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Summary Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Ready for Document Generation</h3>
            <p className="text-gray-600">
              All collected information will be compiled into professional trust documents 
              with blockchain verification and secure delivery to your Gmail/Drive.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Your documents will include:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Professional legal formatting with your personal information</li>
                <li>• Blockchain verification with QR codes</li>
                <li>• Your uploaded barcode for authenticity</li>
                <li>• Secure delivery to your Gmail and Google Drive</li>
                <li>• Minister certification for legal validity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext}>
          Generate Trust Documents
        </Button>
      </div>
    </div>
  );
};

export default StepDocumentSummary;