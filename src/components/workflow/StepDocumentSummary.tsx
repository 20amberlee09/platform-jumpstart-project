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
        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Combine all step data
        const combinedData: any = {};
        progressData?.forEach(step => {
          combinedData[step.course_id] = step.step_data;
        });

        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const completeUserData = {
          profile,
          ...combinedData,
          // Prepare comprehensive data for PDF generation
          documentData: {
            // Personal Information
            identity: combinedData.step_2 || combinedData.identity,
            trustInfo: combinedData.step_3,
            businessInfo: combinedData.step_4,
            
            // Verification Elements
            ministerCertificate: combinedData.step_6?.ministerCertificate,
            barcodeCertificate: combinedData.verification_tools?.barcodeCertificate,
            barcodeImage: combinedData.verification_tools?.barcodeImage,
            
            // Email & Drive
            gmailAddress: combinedData.verification_tools?.gmailAddress,
            googleDriveLink: combinedData.verification_tools?.googleDriveLink,
            
            // Generated Elements (will be populated during generation)
            blockchainHash: null,
            qrCodes: {
              blockchain: null,
              googleDrive: null
            },
            
            // Document metadata
            generatedAt: new Date().toISOString(),
            userId: user.id,
            userEmail: user.email
          }
        };

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

  const identity = allUserData.step_2 || allUserData.identity;
  const trustInfo = allUserData.step_3;
  const businessInfo = allUserData.step_4;
  const ministerInfo = allUserData.step_6;
  const verificationTools = allUserData.verification_tools;

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
          identity, 
          !!(identity?.firstName && identity?.lastName)
        )}
        
        {renderDataSection(
          "Trust Information", 
          FileText, 
          trustInfo, 
          !!(trustInfo?.trustName)
        )}
        
        {renderDataSection(
          "Business Information", 
          FileText, 
          businessInfo, 
          !!(businessInfo?.businessName)
        )}
        
        {renderDataSection(
          "Minister Verification", 
          Upload, 
          ministerInfo, 
          !!(ministerInfo?.ministerCertificate)
        )}
        
        {renderDataSection(
          "Document Verification", 
          Hash, 
          verificationTools, 
          !!(verificationTools?.barcodeImage && verificationTools?.gmailAddress)
        )}
      </div>

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