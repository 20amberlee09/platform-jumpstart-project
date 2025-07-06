import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DocumentUploadProps {
  onUploadSuccess?: (fileUrl: string, fileName: string, fileType: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  uploadPath?: string;
  documentType?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const DocumentUpload = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSizeInMB = 10,
  uploadPath = 'documents',
  documentType = 'general',
  className = '',
  disabled = false
}: DocumentUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')} (PDF, JPG, JPEG, PNG)`;
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size too large. Maximum size: ${maxSizeInMB}MB`;
    }
    
    return null;
  };

  const uploadFileToSupabase = async (file: File, fileId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/${uploadPath}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    // Save file metadata to database
    await supabase
      .from('document_files')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        document_type: documentType,
        metadata: {
          upload_path: uploadPath,
          original_name: file.name
        }
      });

    return publicUrl;
  };

  const processQRExtraction = async (file: File, fileUrl: string): Promise<any> => {
    // Placeholder for QR code extraction logic
    // This will be enhanced in future commands with actual QR processing
    console.log('QR extraction placeholder for:', file.name);
    return null;
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    setIsProcessing(true);

    for (const file of fileArray) {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const validationError = validateFile(file);

      if (validationError) {
        toast({
          title: "Upload Error",
          description: validationError,
          variant: "destructive"
        });
        continue;
      }

      // Add file to upload list
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        // Upload file
        const fileUrl = await uploadFileToSupabase(file, fileId);

        // Process QR extraction if PDF
        if (file.type === 'application/pdf') {
          await processQRExtraction(file, fileUrl);
        }

        clearInterval(progressInterval);

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'success' as const, 
            progress: 100, 
            url: fileUrl 
          } : f
        ));

        toast({
          title: "Upload Successful",
          description: `${file.name} uploaded successfully`,
        });

        onUploadSuccess?.(fileUrl, file.name, file.type);

      } catch (error: any) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'error' as const, 
            error: error.message 
          } : f
        ));

        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload file",
          variant: "destructive"
        });

        onUploadError?.(error.message || "Upload failed");
      }
    }

    setIsProcessing(false);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) {
      return <Image className="h-6 w-6" />;
    }
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="text-lg font-medium mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Documents'}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Drag and drop PDF, JPG, JPEG, or PNG files here, or click to browse
        </div>
        <div className="text-xs text-muted-foreground">
          Supported: PDF, JPG, JPEG, PNG • Max size: {maxSizeInMB}MB
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="text-muted-foreground">
                {getFileIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </div>
                
                {file.status === 'uploading' && (
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {file.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {file.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Processing uploads...
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;