import { Loader2, FileText, Upload, Shield, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  message?: string;
  progress?: number;
  className?: string;
}

export const DocumentGenerationLoader = ({ progress }: { progress?: number }) => (
  <div className="flex flex-col items-center space-y-4 p-8">
    <div className="relative">
      <FileText className="h-12 w-12 text-primary animate-pulse" />
      <Loader2 className="h-6 w-6 animate-spin text-primary absolute -top-1 -right-1" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="font-semibold">Generating Your Document</h3>
      <p className="text-sm text-muted-foreground">Creating professional legal documents...</p>
      {progress !== undefined && (
        <div className="w-64">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  </div>
);

export const BlockchainVerificationLoader = () => (
  <div className="flex flex-col items-center space-y-4 p-8">
    <div className="relative">
      <Shield className="h-12 w-12 text-green-600 animate-pulse" />
      <Zap className="h-4 w-4 text-yellow-500 animate-bounce absolute -top-1 -right-1" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="font-semibold">Blockchain Verification</h3>
      <p className="text-sm text-muted-foreground">Securing your document on XRP Ledger...</p>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Immutable verification in progress</span>
      </div>
    </div>
  </div>
);

export const FileUploadLoader = ({ progress }: { progress?: number }) => (
  <div className="flex flex-col items-center space-y-4 p-6">
    <div className="relative">
      <Upload className="h-10 w-10 text-blue-600 animate-bounce" />
    </div>
    <div className="text-center space-y-2">
      <h4 className="font-medium">Uploading File</h4>
      {progress !== undefined && (
        <div className="w-48">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% uploaded</p>
        </div>
      )}
    </div>
  </div>
);

export const WorkflowNavigationLoader = () => (
  <div className="flex items-center space-x-2 p-4">
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    <span className="text-sm">Preparing next step...</span>
  </div>
);

// Smart loading component that adapts based on context
export const SmartLoader = ({ 
  type, 
  message, 
  progress,
  className = ""
}: {
  type?: 'document' | 'blockchain' | 'upload' | 'navigation' | 'general';
  message?: string;
  progress?: number;
  className?: string;
}) => {
  const baseClasses = `flex items-center justify-center ${className}`;

  switch (type) {
    case 'document':
      return <DocumentGenerationLoader progress={progress} />;
    case 'blockchain':
      return <BlockchainVerificationLoader />;
    case 'upload':
      return <FileUploadLoader progress={progress} />;
    case 'navigation':
      return <WorkflowNavigationLoader />;
    default:
      return (
        <div className={baseClasses}>
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        </div>
      );
  }
};