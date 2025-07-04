import { CourseConfig } from '@/types/course';

export const courseConfigs: Record<string, CourseConfig> = {
  'trust-bootcamp': {
    id: 'trust-bootcamp',
    title: 'Trust Boot Camp',
    description: 'Comprehensive irrevocable living trust creation with asset protection focus',
    price: 497,
    overview: {
      title: 'Legal Document Automation',
      subtitle: '5-Step Process',
      description: 'Our AI-powered platform guides you through each step of creating professional legal documents with automated verification, custom seals, and online notarization.'
    },
    features: [
      'Government ID scanning and verification',
      'OCR data extraction', 
      'Automated NDA creation',
      'Irrevocable living trust configuration',
      'Asset protection planning',
      'Custom document generation',
      'Digital signatures and seals',
      'Online notarization'
    ],
    modules: [
      {
        id: 'nda',
        name: 'NDA Agreement',
        description: 'Non-disclosure agreement signing',
        component: 'StepNDA',
        required: true,
        order: 0,
        icon: 'Shield'
      },
      {
        id: 'payment',
        name: 'Secure Payment',
        description: 'Process course payment',
        component: 'StepPayment',
        required: true,
        order: 1,
        icon: 'CreditCard'
      },
      {
        id: 'identity',
        name: 'Identity Verification',
        description: 'Secure ID verification with OCR integration',
        component: 'Step1Identity',
        required: true,
        order: 2,
        icon: 'FileCheck'
      },
      {
        id: 'trust-config',
        name: 'Trust Configuration',
        description: 'Configure irrevocable living trust details',
        component: 'Step2Trust',
        required: true,
        order: 3,
        icon: 'Scale'
      },
      {
        id: 'document-assembly',
        name: 'Document Assembly',
        description: 'Generate custom trust documents',
        component: 'Step3DocumentAssembly',
        required: true,
        order: 4,
        icon: 'FileText'
      },
      {
        id: 'signatures',
        name: 'Digital Signatures',
        description: 'Collect digital signatures and create seals',
        component: 'StepSignatures',
        required: true,
        order: 5,
        icon: 'Award'
      },
      {
        id: 'review',
        name: 'Final Review',
        description: 'Review and finalize all documents',
        component: 'StepReview',
        required: true,
        order: 6,
        icon: 'CheckCircle'
      }
    ]
  },
  'basic-trust': {
    id: 'basic-trust',
    title: 'Basic Trust Setup',
    description: 'Simple trust creation for basic estate planning',
    price: 297,
    overview: {
      title: 'Basic Trust Creation',
      subtitle: '3-Step Process',
      description: 'Simplified trust creation process for basic estate planning needs.'
    },
    features: [
      'Basic trust configuration',
      'Simple document generation',
      'Digital signatures'
    ],
    modules: [
      {
        id: 'identity',
        name: 'Identity Verification',
        description: 'Basic identity verification',
        component: 'Step1Identity',
        required: true,
        order: 0,
        icon: 'FileCheck'
      },
      {
        id: 'basic-config',
        name: 'Basic Configuration',
        description: 'Simple trust setup',
        component: 'StepBasicConfig',
        required: true,
        order: 1,
        icon: 'Settings'
      },
      {
        id: 'document-assembly',
        name: 'Document Assembly',
        description: 'Generate basic trust documents',
        component: 'Step3DocumentAssembly',
        required: true,
        order: 2,
        icon: 'FileText'
      }
    ]
  }
};