import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  getDummyData: (stepId: string) => any;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

const dummyData = {
  'step-identity': {
    fullName: 'John Michael Smith',
    dateOfBirth: '1985-06-15',
    address: '123 Main Street',
    city: 'Denver',
    state: 'Colorado',
    zipCode: '80202',
    uploadedFiles: [
      {
        id: 'dummy-id-1',
        file: new File(['dummy content'], 'drivers-license.jpg', { type: 'image/jpeg' }),
        requirementId: 'government-id'
      }
    ]
  },
  'step-nda': {
    agreed: true,
    signature: 'John Michael Smith',
    signedAt: new Date().toISOString()
  },
  'step-trust-name': {
    trustBaseName: 'Smith Family',
    fullTrustName: 'Smith Family Ecclesiastic Revocable Living Trust',
    trustType: 'ecclesiastic-revocable-living'
  },
  'step-trust-config': {
    trustPurpose: 'Asset protection and estate planning',
    beneficiaries: ['Jane Smith (Spouse)', 'Michael Smith Jr. (Son)', 'Sarah Smith (Daughter)'],
    successor: 'Jane Smith',
    governingLaw: 'Colorado'
  },
  'step-ordination': {
    ministerName: 'Rev. John Michael Smith',
    ordinationDate: '2024-07-01',
    ministerialCredentials: 'Universal Life Church Minister',
    uploadedFiles: [
      {
        id: 'dummy-ordination-1',
        file: new File(['dummy certificate'], 'ordination-certificate.pdf', { type: 'application/pdf' }),
        requirementId: 'ordination-certificate'
      }
    ]
  },
  'step-gmail-setup': {
    gmailAccount: 'smithfamilyecclesiastictrust@gmail.com',
    googleDriveFolder: 'Smith Family Ecclesiastic Revocable Living Trust',
    isGmailCreated: true,
    isDriveFolderCreated: true
  },
  'step-verification-tools': {
    qrCodes: [
      { type: 'Trust Document', url: 'https://verify.ecclesiastictrust.com/smith-family-2024' },
      { type: 'Minister Credentials', url: 'https://verify.ministers.com/john-smith-2024' }
    ],
    barcodes: [
      { type: 'Document ID', code: 'TRUST-SF-2024-001' },
      { type: 'Verification Code', code: 'VER-JS-MIN-2024' }
    ]
  },
  'step-document-assembly': {
    selectedTemplates: ['Trust Agreement', 'Pour-Over Will', 'Power of Attorney'],
    customizations: {
      'Trust Agreement': { clauses: ['Asset Protection', 'Successor Trustee'], pages: 12 },
      'Pour-Over Will': { clauses: ['Residuary Estate'], pages: 4 },
      'Power of Attorney': { clauses: ['Financial Powers'], pages: 3 }
    }
  },
  'step-document-generation': {
    generatedDocuments: [
      { name: 'Smith Family Trust Agreement.pdf', size: '245 KB', status: 'completed' },
      { name: 'John Smith Pour-Over Will.pdf', size: '128 KB', status: 'completed' },
      { name: 'Power of Attorney.pdf', size: '89 KB', status: 'completed' }
    ]
  },
  'step-signatures': {
    requiredSignatures: [
      { role: 'Trustor', name: 'John Michael Smith', status: 'signed', date: '2024-07-04' },
      { role: 'Witness 1', name: 'Jane Smith', status: 'signed', date: '2024-07-04' },
      { role: 'Witness 2', name: 'Robert Johnson', status: 'pending', date: null }
    ]
  },
  'step-payment': {
    amount: 297,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'completed',
    transactionId: 'DEMO-TXN-2024-001'
  },
  'step-review': {
    reviewComplete: true,
    finalDocuments: [
      'Smith Family Trust Agreement.pdf',
      'John Smith Pour-Over Will.pdf', 
      'Power of Attorney.pdf',
      'Ordination Certificate.pdf'
    ],
    deliveryMethod: 'Email & Google Drive'
  }
};

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  const getDummyData = (stepId: string) => {
    return dummyData[stepId as keyof typeof dummyData] || {};
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setDemoMode, getDummyData }}>
      {children}
    </DemoModeContext.Provider>
  );
};