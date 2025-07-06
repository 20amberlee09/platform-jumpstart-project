import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client, Wallet } from "npm:xrpl@3.0.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔍 XRP Diagnostic Function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    step: 'initialization',
    results: {}
  };

  try {
    // Step 1: Check Environment Variables
    console.log('🔍 Step 1: Checking environment variables...');
    diagnostics.step = 'environment_variables';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const xrpSeed = Deno.env.get('XRP_WALLET_SEED');
    const xrpAddress = Deno.env.get('XRP_WALLET_ADDRESS');
    const xrpNetwork = Deno.env.get('XRP_NETWORK');
    
    diagnostics.results.environment = {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_ANON_KEY: !!supabaseKey,
      XRP_WALLET_SEED: !!xrpSeed,
      XRP_WALLET_ADDRESS: !!xrpAddress,
      XRP_NETWORK: xrpNetwork || 'not_set',
      seed_length: xrpSeed ? xrpSeed.length : 0,
      seed_format: xrpSeed ? (xrpSeed.startsWith('s') ? 'family_seed' : 'other') : 'missing'
    };
    
    console.log('🔍 Environment check:', diagnostics.results.environment);
    
    if (!xrpSeed) {
      throw new Error('XRP_WALLET_SEED environment variable not set');
    }
    
    // Step 2: Test Wallet Creation
    console.log('🔍 Step 2: Testing wallet creation...');
    diagnostics.step = 'wallet_creation';
    
    let wallet;
    try {
      console.log('🔍 Attempting to create wallet from seed...');
      console.log('🔍 Seed format:', xrpSeed.substring(0, 5) + '...' + xrpSeed.substring(xrpSeed.length - 5));
      
      wallet = Wallet.fromSeed(xrpSeed);
      diagnostics.results.wallet = {
        success: true,
        address: wallet.address,
        classicAddress: wallet.classicAddress,
        publicKey: wallet.publicKey.substring(0, 10) + '...',
        privateKey: wallet.privateKey.substring(0, 10) + '...'
      };
      console.log('🔍 Wallet created successfully:', wallet.address);
    } catch (walletError) {
      console.error('🔍 Wallet creation failed:', walletError);
      diagnostics.results.wallet = {
        success: false,
        error: walletError.message,
        errorType: walletError.constructor.name,
        stack: walletError.stack
      };
      throw walletError;
    }
    
    // Step 3: Test XRP Network Connection
    console.log('🔍 Step 3: Testing XRP network connection...');
    diagnostics.step = 'network_connection';
    
    const isProduction = xrpNetwork === 'mainnet';
    const server = isProduction
      ? 'wss://xrplcluster.com/' 
      : 'wss://s.altnet.rippletest.net:51233/';
      
    console.log('🔍 Connecting to:', server);
    
    let client;
    try {
      client = new Client(server);
      console.log('🔍 Client created, attempting connection...');
      
      await client.connect();
      console.log('🔍 Connected successfully');
      
      // Test basic ledger info
      const ledgerInfo = await client.getLedgerIndex();
      console.log('🔍 Current ledger index:', ledgerInfo);
      
      diagnostics.results.connection = {
        success: true,
        server: server,
        network: isProduction ? 'mainnet' : 'testnet',
        ledgerIndex: ledgerInfo,
        connected: client.isConnected()
      };
      
    } catch (connectionError) {
      console.error('🔍 Connection failed:', connectionError);
      diagnostics.results.connection = {
        success: false,
        server: server,
        error: connectionError.message,
        errorType: connectionError.constructor.name
      };
      throw connectionError;
    }
    
    // Step 4: Test Account Info
    console.log('🔍 Step 4: Testing account info...');
    diagnostics.step = 'account_info';
    
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated'
      });
      
      diagnostics.results.account = {
        success: true,
        balance: accountInfo.result.account_data.Balance,
        sequence: accountInfo.result.account_data.Sequence,
        exists: true
      };
      
      console.log('🔍 Account info:', diagnostics.results.account);
      
    } catch (accountError) {
      console.log('🔍 Account info error (might not exist on testnet):', accountError.message);
      diagnostics.results.account = {
        success: false,
        error: accountError.message,
        note: 'Account might not exist on testnet - this is normal for new wallets'
      };
    }
    
    // Step 5: Test Transaction Preparation
    console.log('🔍 Step 5: Testing transaction preparation...');
    diagnostics.step = 'transaction_prep';
    
    try {
      const testTransaction = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Destination: wallet.address,
        Amount: '1000000', // 1 XRP in drops
        Memos: [{
          Memo: {
            MemoType: Buffer.from('test', 'utf8').toString('hex').toUpperCase(),
            MemoData: Buffer.from('diagnostic test', 'utf8').toString('hex').toUpperCase()
          }
        }]
      };
      
      console.log('🔍 Test transaction prepared:', testTransaction);
      diagnostics.results.transaction = {
        success: true,
        transaction: testTransaction,
        note: 'Transaction prepared successfully (not submitted)'
      };
      
    } catch (txError) {
      console.error('🔍 Transaction preparation failed:', txError);
      diagnostics.results.transaction = {
        success: false,
        error: txError.message
      };
    }
    
    // Clean up
    if (client && client.isConnected()) {
      await client.disconnect();
      console.log('🔍 XRP client disconnected');
    }
    
    diagnostics.step = 'completed';
    diagnostics.overall_success = true;
    
    return new Response(JSON.stringify({
      success: true,
      diagnostics: diagnostics
    }), { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });
    
  } catch (error) {
    console.error('🔍 Diagnostic failed at step:', diagnostics.step);
    console.error('🔍 Error:', error);
    console.error('🔍 Stack:', error.stack);
    
    diagnostics.error = {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack,
      step_failed: diagnostics.step
    };
    
    return new Response(JSON.stringify({
      success: false,
      diagnostics: diagnostics
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });
  }
});