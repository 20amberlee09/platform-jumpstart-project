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
    
    // Multiple testnet endpoints for reliability
    const testnetServers = [
      'wss://s.altnet.rippletest.net:51233/',
      'wss://s.altnet.rippletest.net/',
      'wss://testnet.xrpl-labs.com/'
    ];
    
    const productionServers = [
      'wss://xrplcluster.com/',
      'wss://s1.ripple.com/',
      'wss://s2.ripple.com/'
    ];
    
    const servers = isProduction ? productionServers : testnetServers;
    console.log('🔍 Available servers:', servers);
    
    let client;
    let connectedServer = null;
    
    // Try connecting to different servers
    for (const server of servers) {
      try {
        console.log('🔍 Attempting connection to:', server);
        client = new Client(server);
        
        // Set connection timeout
        const connectPromise = client.connect();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        
        if (client.isConnected()) {
          connectedServer = server;
          console.log('🔍 Successfully connected to:', server);
          break;
        }
      } catch (serverError) {
        console.log('🔍 Failed to connect to:', server, serverError.message);
        if (client) {
          try { await client.disconnect(); } catch {}
        }
        continue;
      }
    }
    
    if (!connectedServer) {
      throw new Error('Failed to connect to any XRP server');
    }
    
    // Test basic ledger info
    const ledgerInfo = await client.getLedgerIndex();
    console.log('🔍 Current ledger index:', ledgerInfo);
    
    diagnostics.results.connection = {
      success: true,
      connectedServer: connectedServer,
      network: isProduction ? 'mainnet' : 'testnet',
      ledgerIndex: ledgerInfo,
      connected: client.isConnected(),
      availableServers: servers,
      testedServers: servers.length
    };
    
    } catch (connectionError) {
      console.error('🔍 Connection failed:', connectionError);
      diagnostics.results.connection = {
        success: false,
        availableServers: servers,
        error: connectionError.message,
        errorType: connectionError.constructor.name
      };
      throw connectionError;
    }
    
    // Step 4: Test Account Info and Balance
    console.log('🔍 Step 4: Testing account info and balance...');
    diagnostics.step = 'account_info';
    
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated'
      });
      
      const balanceDrops = parseInt(accountInfo.result.account_data.Balance);
      const balanceXRP = balanceDrops / 1000000;
      const hasMinimumBalance = balanceXRP >= 10; // 10 XRP minimum recommended
      
      diagnostics.results.account = {
        success: true,
        address: wallet.address,
        balance_drops: balanceDrops,
        balance_xrp: balanceXRP,
        sequence: accountInfo.result.account_data.Sequence,
        exists: true,
        has_minimum_balance: hasMinimumBalance,
        can_transact: hasMinimumBalance,
        faucet_needed: !hasMinimumBalance && !isProduction
      };
      
      console.log('🔍 Account info:', diagnostics.results.account);
      
      // If testnet and low balance, provide faucet info
      if (!isProduction && !hasMinimumBalance) {
        diagnostics.results.account.faucet_info = {
          message: 'Testnet wallet needs funding',
          faucet_url: 'https://xrpl.org/xrp-testnet-faucet.html',
          instructions: `Send testnet XRP to: ${wallet.address}`
        };
        console.log('🔍 ⚠️  Testnet wallet needs funding from faucet');
      }
      
    } catch (accountError) {
      console.log('🔍 Account info error:', accountError.message);
      
      // Check if it's an "account not found" error (common on testnet)
      const isAccountNotFound = accountError.message.includes('actNotFound') || 
                               accountError.message.includes('Account not found');
      
      diagnostics.results.account = {
        success: false,
        address: wallet.address,
        exists: false,
        error: accountError.message,
        is_unfunded: isAccountNotFound,
        needs_funding: isAccountNotFound && !isProduction,
        faucet_needed: isAccountNotFound && !isProduction
      };
      
      if (isAccountNotFound && !isProduction) {
        diagnostics.results.account.faucet_info = {
          message: 'Testnet wallet needs initial funding - account does not exist yet',
          faucet_url: 'https://xrpl.org/xrp-testnet-faucet.html',
          instructions: `1. Visit the XRP testnet faucet\n2. Send testnet XRP to: ${wallet.address}\n3. Wait for confirmation\n4. Retry the test`
        };
        console.log('🔍 ⚠️  Account not found - needs testnet faucet funding');
      }
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