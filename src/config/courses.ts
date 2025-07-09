import { CourseConfig } from '@/types/course';

export const courseConfigs: Record<string, CourseConfig> = {
  'trust-bootcamp': {
    id: 'trust-bootcamp',
    title: 'Boot Camp documents',
    description: 'Complete ecclesiastic revocable living trust creation with ministerial ordination',
    price: 150,
    overview: {
      title: 'Boot Camp documents',
      subtitle: 'Complete Trust Creation Package',
      description: 'Our comprehensive $150 package guides you through creating an ecclesiastic revocable living trust with ministerial ordination, verification services, and professional documentation. All required documents must be uploaded before completion.'
    },
    features: [
      'Complete $150 package - no recurring fees',
      'GUIDED: Government ID upload - you provide, we verify automatically',
      'AUTOMATED: Trust name availability verification (USPTO & State searches)',
      'GUIDED: Ministerial ordination certificate upload - you provide the certificate',
      'AUTOMATED: Ecclesiastic revocable living trust document creation',
      'AUTOMATED: Gmail account setup with proper trust naming convention',
      'AUTOMATED: Google Drive folder creation and organization',
      'AUTOMATED: QR code generation for all documentation',
      'GUIDED: Barcode certificate purchase guidance and upload',
      'GUIDED: Custom document seal creation and upload',
      'AUTOMATED: Professional document generation with all verification elements',
      'GUIDED: Document review - you approve before finalization',
      'AUTOMATED: Final document delivery to your Google Drive'
    ],
      modules: [
        {
          id: 'payment',
          name: 'Secure Payment',
          description: 'Automated payment processing - we handle all payment verification and course enrollment',
          component: 'StepPayment',
          required: true,
          order: 0,
          icon: 'CreditCard'
        },
        {
          id: 'nda',
          name: 'NDA Agreement',
          description: 'Guided step: You review and digitally sign the non-disclosure agreement',
          component: 'StepNDA',
          required: true,
          order: 1,
          icon: 'Shield'
        },
        {
          id: 'identity',
          name: 'Identity Verification',
          description: 'Guided step: Upload your government ID - we automatically extract and verify your information using OCR technology',
          component: 'StepIdentity',
          required: true,
          order: 2,
          icon: 'FileCheck'
        },
        {
          id: 'trust-name',
          name: 'Trust Name Selection',
          description: 'Guided step: Choose your trust name - we automatically search USPTO and state databases for availability',
          component: 'StepTrustName',
          required: true,
          order: 3,
          icon: 'Search'
        },
        {
          id: 'ordination',
          name: 'Minister Ordination',
          description: 'Guided step: Upload your ministerial certificate - we verify and integrate it into your trust documents',
          component: 'StepOrdination',
          required: true,
          order: 4,
          icon: 'Award'
        },
        {
          id: 'gmail-setup',
          name: 'Gmail & Drive Setup',
          description: 'Automated process: We create your trust Gmail account and Google Drive folder with proper naming conventions',
          component: 'StepGmailSetup',
          required: true,
          order: 5,
          icon: 'Mail'
        },
        {
          id: 'verification-tools',
          name: 'Verification Tools',
          description: 'Guided step: Upload your barcode certificate and custom seal - we automatically generate QR codes and integrate everything',
          component: 'StepVerificationTools',
          required: true,
          order: 6,
          icon: 'QrCode'
        },
        {
          id: 'document-generation',
          name: 'Document Generation',
          description: 'Fully automated: We generate all trust documents with your verification elements and deliver them to your Google Drive',
          component: 'StepDocumentGeneration',
          required: true,
          order: 7,
          icon: 'FileText'
        },
        {
          id: 'document-delivery',
          name: 'Document Delivery',
          description: 'Download your completed documents and save them to your Google Drive folder for safekeeping',
          component: 'DocumentDelivery',
          required: true,
          order: 8,
          icon: 'FolderOpen'
        }
      ]
  }
};