import { Client, Wallet, convertStringToHex, Payment } from 'xrpl';

interface DocumentHash {
  documentId: string;
  hash: string;
  timestamp: string;
  userInfo: {
    userId: string;
    ministerName?: string;
    trustName?: string;
  };
}

interface BlockchainResult {
  transactionHash: string;
  ledgerIndex: number;
  verificationUrl: string;
  qrCodeData: string;
  timestamp: string;
}

export class XRPLService {
  private static client: Client | null = null;
  private static wallet: Wallet | null = null;

  // Initialize XRP Ledger connection
  static async initialize(): Promise<void> {
    try {
      // Use testnet for development, mainnet for production
      const server = import.meta.env.PROD 
        ? 'wss://xrplcluster.com/' 
        : 'wss://s.altnet.rippletest.net:51233/';
      
      this.client = new Client(server);
      await this.client.connect();
      
      // Create or load wallet for document verification
      // In production, this should come from Supabase edge function with secure secrets
      const seed = 'sEdSKaCy2JT7JaM7v95H9SxkhP9wS2r'; // This will be replaced with secure seed
      this.wallet = Wallet.fromSeed(seed);
      
      console.log('XRPL Service initialized with wallet:', this.wallet.address);
    } catch (error) {
      console.error('Failed to initialize XRPL Service:', error);
      throw error;
    }
  }

  // Submit document hash to XRP Ledger
  static async submitDocumentToBlockchain(
    documentHash: DocumentHash
  ): Promise<BlockchainResult> {
    if (!this.client || !this.wallet) {
      await this.initialize();
    }

    try {
      // Create memo with document information
      const memoData = {
        docId: documentHash.documentId,
        hash: documentHash.hash,
        timestamp: documentHash.timestamp,
        user: documentHash.userInfo.userId,
        minister: documentHash.userInfo.ministerName || '',
        trust: documentHash.userInfo.trustName || ''
      };

      // Convert memo to hex format for XRP Ledger
      const memoHex = convertStringToHex(JSON.stringify(memoData));

      // Prepare transaction
      const transaction: Payment = {
        TransactionType: 'Payment',
        Account: this.wallet!.address,
        Destination: this.wallet!.address, // Self-payment for memo storage
        Amount: '1', // Minimal amount (1 drop = 0.000001 XRP)
        Memos: [
          {
            Memo: {
              MemoType: convertStringToHex('TruthHurtsDocVerification'),
              MemoData: memoHex,
              MemoFormat: convertStringToHex('application/json')
            }
          }
        ]
      };

      // Submit and wait for validation
      const response = await this.client!.submitAndWait(transaction, {
        wallet: this.wallet!
      });

      const transactionHash = response.result.hash;
      const ledgerIndex = Number(response.result.ledger_index) || 0;

      // Create verification URL
      const verificationUrl = import.meta.env.PROD
        ? `https://livenet.xrpl.org/transactions/${transactionHash}`
        : `https://testnet.xrpl.org/transactions/${transactionHash}`;

      // Create QR code data for verification
      const qrCodeData = JSON.stringify({
        platform: 'TruthHurts',
        docId: documentHash.documentId,
        txHash: transactionHash,
        verifyUrl: verificationUrl,
        timestamp: documentHash.timestamp
      });

      return {
        transactionHash,
        ledgerIndex,
        verificationUrl,
        qrCodeData,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Blockchain submission failed:', error);
      throw new Error(`Blockchain verification failed: ${error.message}`);
    }
  }

  // Verify document authenticity
  static async verifyDocument(transactionHash: string): Promise<{
    isValid: boolean;
    documentInfo?: any;
    timestamp?: string;
  }> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const response = await this.client!.request({
        command: 'tx',
        transaction: transactionHash
      });

      if (response.result.validated) {
        // Extract memo data
        const memos = response.result.Memos;
        if (memos && memos.length > 0) {
          const memoData = memos[0].Memo.MemoData;
          const documentInfo = JSON.parse(Buffer.from(memoData, 'hex').toString('utf8'));
          
          return {
            isValid: true,
            documentInfo,
            timestamp: response.result.date ? String(response.result.date) : undefined
          };
        }
      }

      return { isValid: false };
    } catch (error) {
      console.error('Document verification failed:', error);
      return { isValid: false };
    }
  }

  // Generate document hash
  static generateDocumentHash(documentContent: string | Buffer): string {
    // Simple hash generation for browser compatibility
    let hash = 0;
    const str = typeof documentContent === 'string' ? documentContent : documentContent.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and ensure positive
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Disconnect client
  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.wallet = null;
    }
  }
}