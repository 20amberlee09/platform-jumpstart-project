import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize?: number; // in MB
}

interface UploadedFile {
  id: string;
  file: File;
  requirementId: string;
}

interface DocumentUploadProps {
  title: string;
  requirements: DocumentRequirement[];
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  className?: string;
}

const DocumentUpload = ({ 
  title, 
  requirements, 
  uploadedFiles, 
  onFilesChange,
  className = ""
}: DocumentUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = (requirementId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const requirement = requirements.find(r => r.id === requirementId);
    
    if (!requirement) return;

    // Check file size
    if (requirement.maxSize && file.size > requirement.maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `File must be smaller than ${requirement.maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = requirement.acceptedTypes.map(type => type.replace('.', '').toLowerCase());
    
    if (fileType && !acceptedTypes.includes(fileType)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a file of type: ${requirement.acceptedTypes.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Remove existing file for this requirement
    const filteredFiles = uploadedFiles.filter(f => f.requirementId !== requirementId);
    
    // Add new file
    const newFile: UploadedFile = {
      id: `${requirementId}-${Date.now()}`,
      file,
      requirementId
    };

    onFilesChange([...filteredFiles, newFile]);

    toast({
      title: "File Uploaded",
      description: `${requirement.name} has been uploaded successfully.`,
    });
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
    
    toast({
      title: "File Removed",
      description: "Document has been removed.",
    });
  };

  const getFileForRequirement = (requirementId: string) => {
    return uploadedFiles.find(f => f.requirementId === requirementId);
  };

  const getCompletionStatus = () => {
    const requiredCount = requirements.filter(r => r.required).length;
    const completedCount = requirements.filter(r => 
      r.required && getFileForRequirement(r.id)
    ).length;
    return { completed: completedCount, total: requiredCount };
  };

  const { completed, total } = getCompletionStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {completed}/{total} required
            </span>
            {completed === total && total > 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Upload the required documents for this step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requirements.map((requirement) => {
          const uploadedFile = getFileForRequirement(requirement.id);
          
          return (
            <div key={requirement.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{requirement.name}</h4>
                    {requirement.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                    {uploadedFile && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {requirement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepts: {requirement.acceptedTypes.join(', ')}
                    {requirement.maxSize && ` • Max size: ${requirement.maxSize}MB`}
                  </p>
                </div>
              </div>

              {uploadedFile ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {uploadedFile.file.name}
                    </span>
                    <span className="text-xs text-green-600">
                      ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <input
                    type="file"
                    id={`upload-${requirement.id}`}
                    className="hidden"
                    accept={requirement.acceptedTypes.join(',')}
                    onChange={(e) => handleFileUpload(requirement.id, e.target.files)}
                  />
                  <label
                    htmlFor={`upload-${requirement.id}`}
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-center">
                      <span className="font-medium text-primary">Click to upload</span>
                      <span className="text-muted-foreground"> {requirement.name.toLowerCase()}</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;