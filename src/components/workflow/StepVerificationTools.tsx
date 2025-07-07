import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StepVerificationToolsProps {
  onNext: () => void;
  onPrev: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const StepVerificationTools = ({ onNext, onPrev, data, onDataChange }: StepVerificationToolsProps) => {
  const { toast } = useToast();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Initialize from existing data - ONLY RUN ONCE
  useEffect(() => {
    if (data?.ministerCertificate || data?.uploadedFile) {
      setUploadStatus('success');
      setIsValid(true);
    }
  }, []); // Empty dependency array to prevent loop

  // Validate form completion - MEMOIZED TO PREVENT LOOPS
  const validateForm = useCallback(() => {
    const hasFile = uploadedFile || data?.ministerCertificate || data?.uploadedFile;
    setIsValid(!!hasFile);
  }, [uploadedFile, data?.ministerCertificate, data?.uploadedFile]);

  // Only run validation when dependencies actually change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadedFile(file);
      setUploadStatus('success');
      
      // Save to step data - ONLY UPDATE ONCE
      const newData = { 
        ...data, 
        ministerCertificate: file.name,
        uploadedFile: file,
        verificationComplete: true
      };
      
      onDataChange(newData);
      
      toast({
        title: "Upload Successful",
        description: "Minister ordination certificate uploaded successfully.",
      });
      
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (isValid) {
      onNext();
    } else {
      toast({
        title: "Upload Required",
        description: "Please upload your minister ordination certificate to continue.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Minister Ordination Certificate
          </CardTitle>
          <CardDescription>
            Upload your official minister ordination certificate for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate">Certificate File</Label>
            <Input
              id="certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploadStatus === 'uploading'}
            />
          </div>
          
          {uploadStatus === 'uploading' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading...</span>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Certificate uploaded successfully</span>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Upload failed. Please try again.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          type="button"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          type="button"
        >
          Continue to Email Setup
        </Button>
      </div>
    </div>
  );
};

export default StepVerificationTools;