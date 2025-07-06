import { http, HttpResponse } from 'msw'

// Supabase API base URL
const SUPABASE_URL = 'http://localhost:54321'

export const handlers = [
  // Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      }
    })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600
      }
    })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({})
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
    })
  }),

  // Database endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([
      {
        id: 'test-profile-id',
        user_id: 'test-user-id',
        full_name: 'Test User',
        email: 'test@example.com',
        minister_verified: true,
        verification_status: 'verified'
      }
    ])
  }),

  http.get(`${SUPABASE_URL}/rest/v1/courses`, () => {
    return HttpResponse.json([
      {
        id: 'test-course-id',
        title: 'Test Course',
        description: 'Test course description',
        price: 15000,
        is_active: true,
        features: ['Feature 1', 'Feature 2'],
        overview_title: 'Test Overview',
        overview_subtitle: 'Test Subtitle',
        overview_description: 'Test overview description'
      }
    ])
  }),

  http.get(`${SUPABASE_URL}/rest/v1/modules`, () => {
    return HttpResponse.json([
      {
        id: 'test-module-id',
        course_id: 'test-course-id',
        name: 'test-module',
        title: 'Test Module',
        description: 'Test module description',
        component: 'TestComponent',
        order_index: 0,
        required: true,
        content: {},
        templates: []
      }
    ])
  }),

  http.get(`${SUPABASE_URL}/rest/v1/user_progress`, () => {
    return HttpResponse.json([
      {
        id: 'test-progress-id',
        user_id: 'test-user-id',
        course_id: 'test-course-id',
        current_step: 0,
        completed_steps: [],
        is_complete: false,
        step_data: {}
      }
    ])
  }),

  http.post(`${SUPABASE_URL}/rest/v1/user_progress`, () => {
    return HttpResponse.json({
      id: 'test-progress-id',
      user_id: 'test-user-id',
      course_id: 'test-course-id',
      current_step: 1,
      completed_steps: [0],
      is_complete: false,
      step_data: { step0: { completed: true } }
    })
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/user_progress`, () => {
    return HttpResponse.json({
      id: 'test-progress-id',
      user_id: 'test-user-id',
      course_id: 'test-course-id',
      current_step: 2,
      completed_steps: [0, 1],
      is_complete: false,
      step_data: { step0: { completed: true }, step1: { completed: true } }
    })
  }),

  http.get(`${SUPABASE_URL}/rest/v1/gift_codes`, () => {
    return HttpResponse.json([
      {
        id: 'test-gift-code-id',
        code: 'TEST-GIFT-CODE',
        course_id: 'test-course-id',
        created_by: 'test-admin-id',
        used_by: null,
        used_at: null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ])
  }),

  // Edge function endpoints
  http.post(`${SUPABASE_URL}/functions/v1/xrp-submit-document`, () => {
    return HttpResponse.json({
      success: true,
      transactionHash: 'mock-tx-hash-12345',
      ledgerIndex: 12345,
      verificationUrl: 'https://testnet.xrpl.org/transactions/mock-tx-hash-12345',
      network: 'testnet'
    })
  }),

  http.post(`${SUPABASE_URL}/functions/v1/validate-gift-code`, () => {
    return HttpResponse.json({
      valid: true,
      gift_code: {
        id: 'test-gift-code-id',
        code: 'TEST-GIFT-CODE',
        course_id: 'test-course-id'
      }
    })
  }),

  http.post(`${SUPABASE_URL}/functions/v1/redeem-gift-code`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Gift code redeemed successfully'
    })
  }),

  // Storage endpoints
  http.post(`${SUPABASE_URL}/storage/v1/object/documents/*`, () => {
    return HttpResponse.json({
      Key: 'documents/test-file.pdf',
      ETag: 'mock-etag'
    })
  }),

  http.get(`${SUPABASE_URL}/storage/v1/object/documents/*`, () => {
    return new HttpResponse('mock-file-content', {
      headers: {
        'Content-Type': 'application/pdf'
      }
    })
  }),

  // XRP Ledger API endpoints
  http.get('https://api.xrpscan.com/api/v1/transaction/*', () => {
    return HttpResponse.json({
      result: 'tesSUCCESS',
      validated: true,
      date: new Date().toISOString(),
      ledger_index: 12345,
      network: 'testnet'
    })
  }),

  http.get('https://api.xrpscan.com/api/v1/ledger', () => {
    return HttpResponse.json({
      ledger_index: 12345,
      ledger_hash: 'mock-ledger-hash',
      close_time: Date.now()
    })
  }),

  // Error simulation endpoints
  http.get(`${SUPABASE_URL}/rest/v1/error-test`, () => {
    return HttpResponse.json({ error: 'Test error' }, { status: 500 })
  }),

  http.post(`${SUPABASE_URL}/functions/v1/error-test`, () => {
    return HttpResponse.json({ error: 'Edge function error' }, { status: 500 })
  }),

  // Network delay simulation
  http.get(`${SUPABASE_URL}/rest/v1/slow-endpoint`, async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json({ data: 'slow response' })
  })
]