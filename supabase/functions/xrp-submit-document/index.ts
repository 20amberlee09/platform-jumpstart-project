import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client, Wallet, convertStringToHex } from "npm:xrpl@3.0.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔗 XRP Edge Function called:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔗 Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔗 Starting XRP submission process...');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    console.log('🔗 Auth header present:', !!authHeader);
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    console.log('🔗 Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    console.log('🔗 Supabase URL present:', !!supabaseUrl);
    console.log('🔗 Supabase Key present:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is authenticated
    console.log('🔗 Verifying user authentication...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('🔗 Auth error:', authError);
    console.log('🔗 User present:', !!user);
    if (authError || !user) {
      throw new Error(`Authentication failed: ${authError?.message || 'No user'}`)
    }

    console.log('🔗 Parsing request body...');
    const requestBody = await req.json()
    console.log('🔗 Request body:', requestBody);
    const { documentHash, documentId, userInfo } = requestBody
    
    if (!documentHash) {
      throw new Error('Document hash is required')
    }

    // Get secure wallet seed from environment
    console.log('🔗 Checking XRP environment variables...');
    const seed = Deno.env.get('XRP_WALLET_SEED')
    const walletAddress = Deno.env.get('XRP_WALLET_ADDRESS')
    const network = Deno.env.get('XRP_NETWORK')
    
    console.log('🔗 XRP_WALLET_SEED present:', !!seed);
    console.log('🔗 XRP_WALLET_ADDRESS present:', !!walletAddress);
    console.log('🔗 XRP_NETWORK:', network);
    
    if (!seed) {
      throw new Error('XRP wallet seed not configured - please set XRP_WALLET_SEED')
    }
    
    // Initialize XRP client securely
    console.log('🔗 Initializing XRP connection...');
    const isProduction = network === 'mainnet'
    const server = isProduction
      ? 'wss://xrplcluster.com/' 
      : 'wss://s.altnet.rippletest.net:51233/'
    
    console.log(`🔗 Connecting to XRP ${isProduction ? 'mainnet' : 'testnet'} at ${server}`)
    console.log('🔗 Seed format check:', seed.substring(0, 5) + '...' + seed.substring(seed.length - 5));
    console.log('🔗 Seed length:', seed.length);
    console.log('🔗 Seed starts with "s":', seed.startsWith('s'));
    
    let client;
    let wallet;
    
    try {
      console.log('🔗 Creating wallet from seed...');
      
      // Validate seed format before using
      if (!seed.startsWith('s') || seed.length < 25) {
        throw new Error(`Invalid seed format: expected family seed starting with 's', got length ${seed.length}, starts with '${seed.substring(0, 3)}'`);
      }
      
      wallet = Wallet.fromSeed(seed)
      console.log(`🔗 Wallet created with address: ${wallet.address}`)
      
      client = new Client(server)
      console.log('🔗 XRP Client created, connecting...');
      await client.connect()
      console.log('🔗 XRP Client connected successfully');
      
      // Verify wallet has sufficient balance (for testnet, we'll skip this check)
      if (!isProduction) {
        console.log('🔗 Testnet mode - checking account status');
        try {
          const accountInfo = await client.request({
            command: 'account_info',
            account: wallet.address,
            ledger_index: 'validated'
          });
          console.log('🔗 Account balance:', accountInfo.result.account_data.Balance, 'drops');
        } catch (accountError) {
          console.log('🔗 Account not found on testnet (normal for new wallets)');
        }
      }
      
    } catch (xrpError) {
      console.error('🔗 XRP Connection/Wallet Error:', xrpError);
      console.error('🔗 Error details:', {
        message: xrpError.message,
        type: xrpError.constructor.name,
        stack: xrpError.stack
      });
      throw new Error(`XRP connection failed: ${xrpError.message}`);
    }
    
    // Create memo with document information
    console.log('🔗 Creating transaction memo...');
    const memoData = {
      platform: 'TruthHurtz',
      docId: documentId || `doc_${Date.now()}`,
      hash: documentHash.substring(0, 64), // Limit hash length for memo
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email
    }
    
    console.log('🔗 Memo data:', memoData);
    const memoHex = convertStringToHex(JSON.stringify(memoData))
    console.log('🔗 Memo hex length:', memoHex.length);
    
    // Prepare transaction
    console.log('🔗 Preparing XRP transaction...');
    const transaction = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: wallet.address, // Self-payment for memo storage
      Amount: '1000000', // 1 XRP in drops
      Memos: [{
        Memo: {
          MemoType: convertStringToHex('TruthHurtz-DocVerification'),
          MemoData: memoHex,
          MemoFormat: convertStringToHex('application/json')
        }
      }]
    }
    
    console.log('🔗 Transaction prepared:', JSON.stringify(transaction, null, 2));
    console.log('🔗 Submitting transaction to XRP Ledger...')
    
    let response;
    try {
      // Submit and wait for validation
      response = await client.submitAndWait(transaction, { wallet })
      console.log('🔗 Transaction response:', response);
      console.log(`🔗 Transaction successful: ${response.result.hash}`)
    } catch (submitError) {
      console.error('🔗 Transaction submission error:', submitError);
      throw new Error(`Transaction failed: ${submitError.message}`);
    } finally {
      // Always disconnect
      try {
        await client.disconnect()
        console.log('🔗 XRP client disconnected');
      } catch (disconnectError) {
        console.warn('🔗 Error disconnecting XRP client:', disconnectError);
      }
    }
    
    // Save verification record to database
    console.log('🔗 Saving verification record to database...');
    const verificationUrl = isProduction
      ? `https://livenet.xrpl.org/transactions/${response.result.hash}`
      : `https://testnet.xrpl.org/transactions/${response.result.hash}`
      
    const { error: dbError } = await supabaseClient
      .from('blockchain_verifications')
      .insert({
        user_id: user.id,
        transaction_hash: response.result.hash,
        document_id: documentId || `doc_${Date.now()}`,
        blockchain_network: isProduction ? 'XRP Mainnet' : 'XRP Testnet',
        verification_url: verificationUrl,
        metadata: {
          ledger_index: response.result.ledger_index,
          document_hash: documentHash,
          verification_status: 'verified',
          wallet_address: wallet.address
        }
      })

    if (dbError) {
      console.error('🔗 Database save error:', dbError)
      // Don't fail the request - blockchain submission succeeded
    } else {
      console.log('🔗 Verification record saved successfully');
    }
    
    console.log('🔗 XRP submission completed successfully');
    
    return new Response(JSON.stringify({
      success: true,
      transactionHash: response.result.hash,
      ledgerIndex: response.result.ledger_index,
      verificationUrl,
      network: isProduction ? 'mainnet' : 'testnet',
      walletAddress: wallet.address
    }), { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    })
    
  } catch (error) {
    console.error('🔗 XRP submission error:', error);
    console.error('🔗 Error stack:', error.stack);
    
    // Return detailed error information for debugging
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    })
  }
})