import { CourseConfig } from '@/types/course';

export const courseConfigs: Record<string, CourseConfig> = {
  'trust-bootcamp': {
    id: 'trust-bootcamp',
    title: 'Boot Camp',
    description: 'Complete ecclesiastic revocable living trust creation with ministerial ordination',
    price: 150,
    overview: {
      title: 'Boot Camp',
      subtitle: 'Complete Trust Creation Package',
      description: 'Our comprehensive $150 package guides you through creating an ecclesiastic revocable living trust with ministerial ordination, verification services, and professional documentation. All required documents must be uploaded before completion.'
    },
      features: [
      'Complete $150 package - no recurring fees',
      'Government ID verification with document upload',
      'Trust name availability verification (USPTO & State searches)',
      'Ministerial ordination certificate upload',
      'Ecclesiastic revocable living trust creation',
      'Gmail account setup for trust',
      'Google Drive folder creation',
      'QR code generation for documentation',
      'Barcode certificate purchase and upload guidance',
      'Custom document seal creation and upload',
      'Professional document generation with all verification elements',
      'All documents must be uploaded before completion'
    ],
    modules: [
      {
        id: 'payment',
        name: 'Secure Payment',
        description: 'Process course payment',
        component: 'StepPayment',
        required: true,
        order: 0,
        icon: 'CreditCard'
      },
      {
        id: 'nda',
        name: 'NDA Agreement',
        description: 'Non-disclosure agreement signing',
        component: 'StepNDA',
        required: true,
        order: 1,
        icon: 'Shield'
      },
      {
        id: 'identity',
        name: 'Identity Verification',
        description: 'ID verification and personal information collection',
        component: 'StepIdentity',
        required: true,
        order: 2,
        icon: 'FileCheck'
      },
      {
        id: 'trust-name',
        name: 'Trust Name Selection',
        description: 'Choose trust name and verify availability',
        component: 'StepTrustName',
        required: true,
        order: 3,
        icon: 'Search'
      },
      {
        id: 'ordination',
        name: 'Minister Ordination',
        description: 'Obtain ministerial certificate of ordination',
        component: 'StepOrdination',
        required: true,
        order: 4,
        icon: 'Award'
      },
      {
        id: 'gmail-setup',
        name: 'Gmail & Drive Setup',
        description: 'Create Gmail account and Google Drive folder',
        component: 'StepGmailSetup',
        required: true,
        order: 5,
        icon: 'Mail'
      },
      {
        id: 'verification-tools',
        name: 'Verification Tools',
        description: 'Generate QR codes, barcode certificate, and document seal',
        component: 'StepVerificationTools',
        required: true,
        order: 6,
        icon: 'QrCode'
      },
      {
        id: 'document-generation',
        name: 'Document Generation',
        description: 'Generate trust documents with verification elements',
        component: 'StepDocumentGeneration',
        required: true,
        order: 7,
        icon: 'FileText'
      }
    ]
  }
};