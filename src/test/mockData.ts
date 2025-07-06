import { User, Session } from '@supabase/supabase-js'

// Authentication Mock Data
export const mockUsers = {
  regularUser: {
    id: 'user-123',
    email: 'user@example.com',
    user_metadata: {
      full_name: 'John Doe'
    },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString()
  } as User,

  adminUser: {
    id: 'admin-123',
    email: 'admin@example.com',
    user_metadata: {
      full_name: 'Admin User'
    },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString()
  } as User,

  ministerUser: {
    id: 'minister-123',
    email: 'minister@example.com',
    user_metadata: {
      full_name: 'Rev. Minister Smith'
    },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString()
  } as User
}

export const mockSessions = {
  regular: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUsers.regularUser
  } as Session,

  admin: {
    access_token: 'admin-access-token',
    refresh_token: 'admin-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUsers.adminUser
  } as Session
}

// Profile Mock Data
export const mockProfiles = {
  regular: {
    id: 'profile-123',
    user_id: 'user-123',
    full_name: 'John Doe',
    email: 'user@example.com',
    minister_verified: false,
    verification_status: 'pending',
    minister_name: null,
    minister_certificate_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  verifiedMinister: {
    id: 'minister-profile-123',
    user_id: 'minister-123',
    full_name: 'Rev. Minister Smith',
    email: 'minister@example.com',
    minister_verified: true,
    verification_status: 'verified',
    minister_name: 'Rev. Minister Smith',
    minister_certificate_url: 'https://storage.example.com/certificate.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  pendingMinister: {
    id: 'pending-minister-123',
    user_id: 'pending-user-123',
    full_name: 'Pending Minister',
    email: 'pending@example.com',
    minister_verified: false,
    verification_status: 'pending',
    minister_name: 'Rev. Pending Minister',
    minister_certificate_url: 'https://storage.example.com/pending-cert.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Course Mock Data
export const mockCourses = {
  active: {
    id: 'course-123',
    title: 'Complete Ministry Certification',
    description: 'Comprehensive ministry training course',
    price: 15000,
    is_active: true,
    features: ['Digital Certification', 'Document Templates', 'Legal Support'],
    overview_title: 'Become a Certified Minister',
    overview_subtitle: 'Complete certification in 7 steps',
    overview_description: 'Transform your calling into official certification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  inactive: {
    id: 'course-inactive',
    title: 'Inactive Course',
    description: 'This course is not active',
    price: 10000,
    is_active: false,
    features: [],
    overview_title: 'Inactive Course',
    overview_subtitle: 'Not available',
    overview_description: 'This course is currently inactive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Module Mock Data
export const mockModules = [
  {
    id: 'module-identity',
    course_id: 'course-123',
    name: 'identity',
    title: 'Personal Identity',
    description: 'Provide your personal information',
    component: 'StepIdentity',
    order_index: 0,
    required: true,
    icon: 'User',
    content: {},
    templates: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'module-ordination',
    course_id: 'course-123',
    name: 'ordination',
    title: 'Ordination Information',
    description: 'Minister ordination details',
    component: 'StepOrdination',
    order_index: 1,
    required: true,
    icon: 'Award',
    content: {},
    templates: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// User Progress Mock Data
export const mockUserProgress = {
  new: {
    id: 'progress-new',
    user_id: 'user-123',
    course_id: 'course-123',
    current_step: 0,
    completed_steps: [],
    is_complete: false,
    step_data: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  inProgress: {
    id: 'progress-active',
    user_id: 'user-123',
    course_id: 'course-123',
    current_step: 2,
    completed_steps: [0, 1],
    is_complete: false,
    step_data: {
      identity: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123'
      },
      ordination: {
        ministerName: 'Rev. John Doe',
        ordinationDate: '2023-01-15'
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  complete: {
    id: 'progress-complete',
    user_id: 'minister-123',
    course_id: 'course-123',
    current_step: 7,
    completed_steps: [0, 1, 2, 3, 4, 5, 6],
    is_complete: true,
    step_data: {
      identity: { fullName: 'Rev. Minister Smith' },
      ordination: { ministerName: 'Rev. Minister Smith' },
      nda: { accepted: true },
      verification: { status: 'verified' },
      documents: { generated: true }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Order Mock Data
export const mockOrders = {
  pending: {
    id: 'order-pending',
    user_id: 'user-123',
    course_id: 'course-123',
    amount: 15000,
    currency: 'usd',
    status: 'pending',
    stripe_session_id: 'cs_test_pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  completed: {
    id: 'order-completed',
    user_id: 'user-123',
    course_id: 'course-123',
    amount: 15000,
    currency: 'usd',
    status: 'completed',
    stripe_session_id: 'cs_test_completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Gift Code Mock Data
export const mockGiftCodes = {
  valid: {
    id: 'gift-valid',
    code: 'VALID-GIFT-CODE',
    course_id: 'course-123',
    created_by: 'admin-123',
    used_by: null,
    used_at: null,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  used: {
    id: 'gift-used',
    code: 'USED-GIFT-CODE',
    course_id: 'course-123',
    created_by: 'admin-123',
    used_by: 'user-123',
    used_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  expired: {
    id: 'gift-expired',
    code: 'EXPIRED-GIFT-CODE',
    course_id: 'course-123',
    created_by: 'admin-123',
    used_by: null,
    used_at: null,
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Document Mock Data
export const mockDocuments = {
  certificate: {
    id: 'doc-certificate',
    user_id: 'minister-123',
    course_id: 'course-123',
    file_name: 'ministry-certificate.pdf',
    file_type: 'application/pdf',
    file_url: 'https://storage.example.com/ministry-certificate.pdf',
    file_size: 1024000,
    document_type: 'certificate',
    metadata: {
      minister_name: 'Rev. Minister Smith',
      issue_date: '2023-12-01',
      blockchain_hash: 'abc123def456'
    },
    upload_date: new Date().toISOString()
  },

  nda: {
    id: 'doc-nda',
    user_id: 'user-123',
    course_id: 'course-123',
    file_name: 'nda-agreement.pdf',
    file_type: 'application/pdf',
    file_url: 'https://storage.example.com/nda-agreement.pdf',
    file_size: 512000,
    document_type: 'nda',
    metadata: {
      signed_date: '2023-11-15',
      agreement_version: '1.0'
    },
    upload_date: new Date().toISOString()
  }
}

// XRP Ledger Mock Data
export const mockXRPLResponses = {
  successful: {
    success: true,
    transactionHash: 'A1B2C3D4E5F6789012345678901234567890ABCDEF',
    ledgerIndex: 12345678,
    verificationUrl: 'https://testnet.xrpl.org/transactions/A1B2C3D4E5F6789012345678901234567890ABCDEF',
    network: 'testnet',
    timestamp: new Date().toISOString()
  },

  failed: {
    success: false,
    error: 'Transaction failed validation',
    network: 'testnet',
    timestamp: new Date().toISOString()
  },

  verification: {
    verified: true,
    timestamp: '2023-12-01T10:00:00Z',
    ledgerIndex: 12345678,
    transactionHash: 'A1B2C3D4E5F6789012345678901234567890ABCDEF',
    network: 'testnet'
  }
}

// Error Mock Data
export const mockErrors = {
  network: new Error('Network request failed'),
  authentication: new Error('Authentication required'),
  validation: new Error('Validation failed'),
  permission: new Error('Permission denied'),
  notFound: new Error('Resource not found'),
  serverError: new Error('Internal server error')
}

// Performance Mock Data
export const mockPerformanceData = {
  fastRender: { renderTime: 8.5, component: 'FastComponent' },
  slowRender: { renderTime: 150.2, component: 'SlowComponent' },
  networkDelay: { duration: 2000, endpoint: '/api/slow-endpoint' },
  memoryUsage: { heapUsed: 15728640, heapTotal: 20971520 }
}

// Factory functions for generating test data
export const createMockUser = (overrides = {}) => ({
  ...mockUsers.regularUser,
  ...overrides
})

export const createMockProfile = (overrides = {}) => ({
  ...mockProfiles.regular,
  ...overrides
})

export const createMockCourse = (overrides = {}) => ({
  ...mockCourses.active,
  ...overrides
})

export const createMockProgress = (overrides = {}) => ({
  ...mockUserProgress.new,
  ...overrides
})

export const createMockOrder = (overrides = {}) => ({
  ...mockOrders.pending,
  ...overrides
})

export const createMockGiftCode = (overrides = {}) => ({
  ...mockGiftCodes.valid,
  ...overrides
})