import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client, Wallet, convertStringToHex } from "npm:xrpl@3.0.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    const { documentHash, documentId, userInfo } = await req.json()
    
    if (!documentHash) {
      throw new Error('Document hash is required')
    }

    // Get secure wallet seed from environment
    const seed = Deno.env.get('XRP_WALLET_SEED')
    if (!seed) {
      throw new Error('XRP wallet not configured')
    }
    
    // Initialize XRP client securely
    const isProduction = Deno.env.get('XRP_NETWORK') === 'mainnet'
    const server = isProduction
      ? 'wss://xrplcluster.com/' 
      : 'wss://s.altnet.rippletest.net:51233/'
    
    console.log(`Connecting to XRP ${isProduction ? 'mainnet' : 'testnet'}`)
    
    const client = new Client(server)
    await client.connect()
    
    const wallet = Wallet.fromSeed(seed)
    console.log(`Using wallet address: ${wallet.address}`)
    
    // Create memo with document information
    const memoData = {
      platform: 'TruthHurtz',
      docId: documentId || `doc_${Date.now()}`,
      hash: documentHash,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email
    }
    
    const memoHex = convertStringToHex(JSON.stringify(memoData))
    
    // Prepare transaction
    const transaction = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: wallet.address, // Self-payment for memo storage
      Amount: '1000000', // 1 XRP
      Memos: [{
        Memo: {
          MemoType: convertStringToHex('TruthHurtz-DocVerification'),
          MemoData: memoHex,
          MemoFormat: convertStringToHex('application/json')
        }
      }]
    }
    
    console.log('Submitting transaction to XRP Ledger...')
    
    // Submit and wait for validation
    const response = await client.submitAndWait(transaction, { wallet })
    await client.disconnect()
    
    console.log(`Transaction successful: ${response.result.hash}`)
    
    // Save verification record to database
    const { error: dbError } = await supabaseClient
      .from('blockchain_verifications')
      .insert({
        user_id: user.id,
        transaction_hash: response.result.hash,
        document_id: documentId,
        blockchain_network: isProduction ? 'XRP Mainnet' : 'XRP Testnet',
        verification_url: isProduction
          ? `https://livenet.xrpl.org/transactions/${response.result.hash}`
          : `https://testnet.xrpl.org/transactions/${response.result.hash}`,
        metadata: {
          ledger_index: response.result.ledger_index,
          document_hash: documentHash,
          verification_status: 'verified'
        }
      })

    if (dbError) {
      console.error('Database save error:', dbError)
      // Don't fail the request - blockchain submission succeeded
    }
    
    const verificationUrl = isProduction
      ? `https://livenet.xrpl.org/transactions/${response.result.hash}`
      : `https://testnet.xrpl.org/transactions/${response.result.hash}`
    
    return new Response(JSON.stringify({
      success: true,
      transactionHash: response.result.hash,
      ledgerIndex: response.result.ledger_index,
      verificationUrl,
      network: isProduction ? 'mainnet' : 'testnet'
    }), { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    })
    
  } catch (error) {
    console.error('XRP submission error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500, 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    })
  }
})