import { supabase } from '@/integrations/supabase/client';

export class XRPLService {
  /**
   * Submit document hash to XRP Ledger via secure Edge Function
   */
  static async submitDocumentToBlockchain(
    documentHash: string, 
    documentId?: string, 
    userInfo?: any
  ) {
    try {
      console.log('XRPLService: Submitting document to blockchain via Edge Function');
      console.log('Document hash:', documentHash);

      const { data, error } = await supabase.functions.invoke('xrp-submit-document', {
        body: {
          documentHash,
          documentId: documentId || `doc_${Date.now()}`,
          userInfo: userInfo || {}
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Edge function returned error:', data);
        throw new Error(data?.error || 'Unknown blockchain submission error');
      }

      console.log('Blockchain submission successful:', data.transactionHash);

      return {
        transactionHash: data.transactionHash,
        ledgerIndex: data.ledgerIndex,
        verificationUrl: data.verificationUrl,
        proof: `XRP Ledger ${data.network} Verification`,
        timestamp: new Date().toISOString(),
        network: data.network
      };

    } catch (error) {
      console.error('XRP Ledger submission failed:', error);
      throw new Error(`Blockchain verification failed: ${error.message}`);
    }
  }

  /**
   * Verify document authenticity using public XRP Ledger API
   */
  static async verifyDocument(transactionHash: string) {
    try {
      console.log('XRPLService: Verifying document with transaction:', transactionHash);
      
      // Use public XRP Ledger API for verification
      const response = await fetch(`https://api.xrpscan.com/api/v1/transaction/${transactionHash}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      const isValid = data.result === 'tesSUCCESS' && data.validated;
      
      return {
        verified: isValid,
        timestamp: data.date,
        ledgerIndex: data.ledger_index,
        transactionHash: transactionHash,
        network: data.network || 'unknown'
      };

    } catch (error) {
      console.error('Document verification failed:', error);
      return { 
        verified: false, 
        error: error.message,
        transactionHash 
      };
    }
  }

  /**
   * Generate secure document hash using Web Crypto API
   */
  static async generateDocumentHash(documentContent: ArrayBuffer): Promise<string> {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-512', documentContent);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Hash generation failed:', error);
      throw new Error('Failed to generate document hash');
    }
  }

  /**
   * Check XRP Ledger network status
   */
  static async getNetworkStatus(): Promise<{ network: string; connected: boolean }> {
    try {
      const response = await fetch('https://api.xrpscan.com/api/v1/ledger');
      const isConnected = response.ok;
      
      return {
        network: import.meta.env.PROD ? 'mainnet' : 'testnet',
        connected: isConnected
      };
    } catch (error) {
      return {
        network: 'unknown',
        connected: false
      };
    }
  }
}