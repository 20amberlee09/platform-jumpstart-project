import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, ExternalLink, FileText, Image as ImageIcon, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from '@/hooks/useAutoSave';

interface StepVerificationToolsProps {
  onNext: () => void;
  onPrev: () => void;
  data: any;
  onDataChange: (data: any) => void;
  updateStepData?: (stepKey: string, data: any) => void;
  currentStepKey?: string;
}

const StepVerificationTools = ({ onNext, onPrev, data, onDataChange, updateStepData, currentStepKey }: StepVerificationToolsProps) => {
  const { toast } = useToast();
  
  // Barcode states
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [barcodeImageFile, setBarcodeImageFile] = useState<File | null>(null);
  const [certificateStatus, setCertificateStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [imageStatus, setImageStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  // Email states
  const [gmailAddress, setGmailAddress] = useState('');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [emailSetupComplete, setEmailSetupComplete] = useState(false);
  
  // Validation states
  const [barcodeValid, setBarcodeValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const saveDataRef = useRef(false);

  // Prepare comprehensive step data
  const stepData = React.useMemo(() => ({
    // Barcode data
    barcodeCertificate: certificateFile?.name || data?.barcodeCertificate,
    barcodeImage: barcodeImageFile?.name || data?.barcodeImage,
    barcodeCertificateFile: certificateFile || data?.barcodeCertificateFile,
    barcodeImageFile: barcodeImageFile || data?.barcodeImageFile,
    barcodeComplete: barcodeValid,
    
    // Email data
    gmailAddress,
    googleDriveLink,
    emailSetupComplete,
    emailComplete: emailValid,
    
    // Combined completion status
    verificationComplete: barcodeValid && emailValid,
    
    // For PDF generation - include all verification elements
    verification: {
      ...data?.verification,
      barcode: {
        certificateName: certificateFile?.name || data?.barcodeCertificate,
        imageName: barcodeImageFile?.name || data?.barcodeImage,
        hasBarcode: barcodeValid
      },
      email: {
        gmail: gmailAddress,
        driveLink: googleDriveLink,
        setupComplete: emailValid
      }
    }
  }), [certificateFile, barcodeImageFile, data, barcodeValid, gmailAddress, googleDriveLink, emailSetupComplete, emailValid]);

  // Auto-save this step data using consistent key
  useAutoSave({ key: 'step_7', data: stepData });

  // Initialize from existing data
  useEffect(() => {
    // Initialize barcode data
    if (data?.barcodeCertificate || data?.barcodeImage) {
      if (data.barcodeCertificate) setCertificateStatus('success');
      if (data.barcodeImage) setImageStatus('success');
    }
    
    // Initialize email data
    if (data?.gmailAddress) setGmailAddress(data.gmailAddress);
    if (data?.googleDriveLink) setGoogleDriveLink(data.googleDriveLink);
    if (data?.emailSetupComplete) setEmailSetupComplete(data.emailSetupComplete);
  }, []);

  // Auto-save when data changes (with loop prevention)
  useEffect(() => {
    if ((barcodeValid || emailValid)) {
      if (!saveDataRef.current) {
        console.log('Auto-saving verification data:', stepData);
        saveDataRef.current = true;
        
        // Only call onDataChange if it's provided
        if (onDataChange && typeof onDataChange === 'function') {
          onDataChange(stepData);
        }
        
        setTimeout(() => {
          saveDataRef.current = false;
        }, 1000);
      }
    }
  }, [barcodeValid, emailValid, stepData]);

  // Validate barcode completion
  useEffect(() => {
    const hasFiles = (certificateFile || data?.barcodeCertificateFile) && 
                    (barcodeImageFile || data?.barcodeImageFile);
    setBarcodeValid(!!hasFiles);
  }, [certificateFile, barcodeImageFile, data?.barcodeCertificateFile, data?.barcodeImageFile]);

  // Validate email completion
  useEffect(() => {
    const validEmail = gmailAddress && gmailAddress.includes('@gmail.com');
    const validDrive = googleDriveLink && googleDriveLink.includes('drive.google.com');
    setEmailValid(!!(validEmail && validDrive));
  }, [gmailAddress, googleDriveLink]);

  // Overall validation
  useEffect(() => {
    setIsValid(barcodeValid && emailValid);
  }, [barcodeValid, emailValid]);

  // Barcode upload handlers
  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCertificateStatus('uploading');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCertificateFile(file);
      setCertificateStatus('success');
      
      toast({
        title: "Certificate Uploaded",
        description: "Barcode certificate uploaded successfully.",
      });
    } catch (error) {
      setCertificateStatus('error');
      toast({
        title: "Upload Failed",
        description: "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageStatus('uploading');
    
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      setBarcodeImageFile(file);
      setImageStatus('success');
      
      toast({
        title: "Barcode Image Uploaded",
        description: "Barcode image uploaded successfully.",
      });
    } catch (error: any) {
      setImageStatus('error');
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (isValid) {
      if (updateStepData && currentStepKey) {
        updateStepData(currentStepKey, stepData);
      }
      
      // Only call onDataChange if it's provided
      if (onDataChange && typeof onDataChange === 'function') {
        onDataChange(stepData);
      }
      
      setTimeout(() => {
        onNext();
      }, 100);
    } else {
      toast({
        title: "Setup Required",
        description: "Please complete both barcode verification and email setup to continue.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    onPrev();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Document Verification Setup
          </CardTitle>
          <CardDescription>
            Set up your document verification system with barcode authentication and email integration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* BARCODE SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Barcode Verification System
          </CardTitle>
          <CardDescription>
            Upload your unique barcode certificate and barcode image for document verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">How to Get Your Barcode:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
              <li>Visit GS1 US (gs1us.org) or an authorized barcode provider</li>
              <li>Purchase a unique UPC/EAN barcode for your documents</li>
              <li>Download your barcode certificate (PDF) and barcode image (PNG/JPG)</li>
              <li>Upload both files below for document verification</li>
            </ol>
            <div className="mt-3">
              <a 
                href="https://www.gs1us.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <ExternalLink className="h-3 w-3" />
                Get Your Barcode from GS1 US
              </a>
            </div>
          </div>

          {/* Certificate Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificate" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Barcode Certificate
              </Label>
              <Input
                id="certificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleCertificateUpload}
                disabled={certificateStatus === 'uploading'}
              />
              
              {certificateStatus === 'uploading' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
              
              {certificateStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Certificate uploaded</span>
                </div>
              )}
            </div>

            {/* Barcode Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="barcodeImage" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Barcode Image
              </Label>
              <Input
                id="barcodeImage"
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleImageUpload}
                disabled={imageStatus === 'uploading'}
              />
              
              {imageStatus === 'uploading' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
              
              {imageStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Image uploaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Barcode Status */}
          <div className={`p-3 rounded-lg border ${barcodeValid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {barcodeValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Barcode verification complete</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Upload both files to complete barcode verification</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EMAIL SETUP SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email & Drive Integration
          </CardTitle>
          <CardDescription>
            Connect your Gmail and Google Drive for document delivery and storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Email Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-green-800 text-sm">
              <li>Use your existing Gmail address or create a new one for documents</li>
              <li>Create a Google Drive folder for your verified documents</li>
              <li>Share the folder and copy the sharing link</li>
              <li>Enter both details below for automatic document delivery</li>
            </ol>
          </div>

          {/* Email Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Gmail Address
              </Label>
              <Input
                id="gmail"
                type="email"
                placeholder="yourname@gmail.com"
                value={gmailAddress}
                onChange={(e) => setGmailAddress(e.target.value)}
              />
              {gmailAddress && !gmailAddress.includes('@gmail.com') && (
                <p className="text-red-600 text-sm">Please enter a valid Gmail address</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driveLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Google Drive Link
              </Label>
              <Input
                id="driveLink"
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={googleDriveLink}
                onChange={(e) => setGoogleDriveLink(e.target.value)}
              />
              {googleDriveLink && !googleDriveLink.includes('drive.google.com') && (
                <p className="text-red-600 text-sm">Please enter a valid Google Drive link</p>
              )}
            </div>
          </div>

          {/* Email Status */}
          <div className={`p-3 rounded-lg border ${emailValid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {emailValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Email integration complete</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Enter Gmail address and Drive link to complete setup</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Status */}
      <Card>
        <CardContent className="pt-6">
          <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="text-green-800 font-medium">Document verification setup complete!</h4>
                    <p className="text-green-700 text-sm">All verification elements are ready for document generation</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Complete both sections to continue</h4>
                    <p className="text-yellow-700 text-sm">
                      {!barcodeValid && "Barcode verification needed"} 
                      {!barcodeValid && !emailValid && " • "}
                      {!emailValid && "Email setup needed"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} type="button">
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          type="button"
        >
          Continue to Document Generation
        </Button>
      </div>
    </div>
  );
};

export default StepVerificationTools;