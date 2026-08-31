import { vi } from 'vitest'
import { azureAuth } from './azure-auth.js'

const msalInstance = vi.hoisted(() => ({
  getAuthCodeUrl: vi.fn(),
  acquireTokenByCode: vi.fn()
}))
const mockMsalClient = vi.hoisted(() => vi.fn(() => msalInstance))
const mockCrypto = vi.hoisted(() => ({ createNewGuid: vi.fn() }))
const mockConfig = vi.hoisted(() => ({ get: vi.fn() }))
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}))

vi.mock('@azure/msal-node', () => ({ CryptoProvider: vi.fn(() => mockCrypto) }))
vi.mock('../../config/azure-auth.js', () => ({ msalClient: mockMsalClient }))
vi.mock('../../config/config.js', () => ({ config: mockConfig }))
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => mockLogger
}))

const SCOPES = ['openid', 'profile', 'email']
const REDIRECT_URI = 'http://localhost:3000/auth/callback'
const TENANT_ID = 'tenant-123'
const AUTH_URL = 'https://login.microsoftonline.com/authorize?state=S'
const AUTHORITY_HOST = 'https://login.microsoftonline.com'

function register() {
  const handlers = {}
  const server = {
    route: vi.fn((routes) => routes.forEach((r) => (handlers[r.path] = r)))
  }
  azureAuth.plugin.register(server)
  return { handlers, server }
}

const makeH = () => ({
  redirect: vi.fn((url) => ({ redirect: url })),
  view: vi.fn((view, context) => ({ view, context }))
})

function makeCallbackRequest({
  query = {},
  authFlow = { state: 'S', nonce: 'N' },
  returnTo = null
} = {}) {
  return {
    query,
    cookieAuth: { set: vi.fn(), clear: vi.fn() },
    yar: {
      get: vi.fn((k) =>
        k === 'authFlow' ? authFlow : k === 'returnTo' ? returnTo : null
      ),
      set: vi.fn(),
      clear: vi.fn(),
      reset: vi.fn()
    }
  }
}

describe('#azureAuth', () => {
  beforeEach(() => {
    mockConfig.get.mockImplementation((key) => {
      if (key === 'azure.redirectUri') return REDIRECT_URI
      if (key === 'azure.tenantId') return TENANT_ID
      if (key === 'azure.authorityHost') return AUTHORITY_HOST
      return null
    })
  })

  describe('When the plugin is registered', () => {
    test('Should export a plugin named "azure-auth"', () => {
      expect(azureAuth.plugin.name).toBe('azure-auth')
    })

    test('Should register login, callback and logout as public GET routes', () => {
      const { handlers, server } = register()
      expect(server.route).toHaveBeenCalledTimes(1)
      for (const path of ['/auth/login', '/auth/callback', '/auth/logout']) {
        expect(handlers[path].method).toBe('GET')
        expect(handlers[path].options).toEqual({ auth: false })
      }
    })
  })

  describe('When a user starts sign-in', () => {
    test('Should mint state and nonce, store them in the session and redirect to Azure', async () => {
      mockCrypto.createNewGuid.mockReturnValueOnce('S').mockReturnValueOnce('N')
      msalInstance.getAuthCodeUrl.mockResolvedValueOnce(AUTH_URL)
      const { handlers } = register()
      const request = { yar: { set: vi.fn() } }
      const h = makeH()

      await handlers['/auth/login'].handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith('authFlow', {
        state: 'S',
        nonce: 'N'
      })
      expect(msalInstance.getAuthCodeUrl).toHaveBeenCalledWith({
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        responseMode: 'query',
        prompt: 'select_account',
        state: 'S',
        nonce: 'N'
      })
      expect(h.redirect).toHaveBeenCalledWith(AUTH_URL)
    })

    test('Should render the error page when building the auth URL fails', async () => {
      mockCrypto.createNewGuid.mockReturnValue('X')
      msalInstance.getAuthCodeUrl.mockRejectedValueOnce(new Error('boom'))
      const { handlers } = register()
      const h = makeH()

      await handlers['/auth/login'].handler({ yar: { set: vi.fn() } }, h)

      expect(h.view).toHaveBeenCalledWith(
        'error/index',
        expect.objectContaining({ message: expect.any(String) })
      )
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('When Azure calls back', () => {
    test('Should exchange the code and set a minimal session when the state matches', async () => {
      msalInstance.acquireTokenByCode.mockResolvedValueOnce({
        account: {
          homeAccountId: 'oid-1',
          username: 'admin@defra.gov.uk',
          name: 'Admin'
        }
      })
      const { handlers } = register()
      const request = makeCallbackRequest({ query: { code: 'C', state: 'S' } })
      const h = makeH()

      await handlers['/auth/callback'].handler(request, h)

      expect(msalInstance.acquireTokenByCode).toHaveBeenCalledWith({
        code: 'C',
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        nonce: 'N'
      })
      expect(request.cookieAuth.set).toHaveBeenCalledWith({
        isAuthenticated: true,
        user: { id: 'oid-1', email: 'admin@defra.gov.uk', name: 'Admin' }
      })
      expect(request.yar.clear).toHaveBeenCalledWith('authFlow')
      expect(h.redirect).toHaveBeenCalledWith('/')
    })

    test('Should redirect to the saved returnTo after login', async () => {
      msalInstance.acquireTokenByCode.mockResolvedValueOnce({
        account: { homeAccountId: 'o', username: 'a@b.c', name: 'A' }
      })
      const { handlers } = register()
      const request = makeCallbackRequest({
        query: { code: 'C', state: 'S' },
        returnTo: '/applications/42'
      })
      const h = makeH()

      await handlers['/auth/callback'].handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/applications/42')
    })

    test('Should reject a mismatched state without exchanging the code', async () => {
      const { handlers } = register()
      const request = makeCallbackRequest({
        query: { code: 'C', state: 'WRONG' },
        authFlow: { state: 'S', nonce: 'N' }
      })
      const h = makeH()

      await handlers['/auth/callback'].handler(request, h)

      expect(msalInstance.acquireTokenByCode).not.toHaveBeenCalled()
      expect(request.cookieAuth.set).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    test('Should reject when the authorization code is missing', async () => {
      const { handlers } = register()
      const h = makeH()

      await handlers['/auth/callback'].handler(
        makeCallbackRequest({ query: { state: 'S' } }),
        h
      )

      expect(msalInstance.acquireTokenByCode).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('error/index', expect.any(Object))
    })

    test('Should handle an Azure error response, such as a cancelled sign-in', async () => {
      const { handlers } = register()
      const h = makeH()

      await handlers['/auth/callback'].handler(
        makeCallbackRequest({ query: { error: 'access_denied' } }),
        h
      )

      expect(msalInstance.acquireTokenByCode).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    test('Should render the error page if the token exchange throws', async () => {
      msalInstance.acquireTokenByCode.mockRejectedValueOnce(
        new Error('token fail')
      )
      const { handlers } = register()
      const request = makeCallbackRequest({ query: { code: 'C', state: 'S' } })
      const h = makeH()

      await handlers['/auth/callback'].handler(request, h)

      expect(request.cookieAuth.set).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('When a user signs out', () => {
    test('Should clear the session and redirect to the Microsoft logout endpoint', () => {
      const { handlers } = register()
      const request = {
        query: {},
        cookieAuth: { clear: vi.fn() },
        yar: { reset: vi.fn() }
      }
      const h = makeH()

      handlers['/auth/logout'].handler(request, h)

      expect(request.cookieAuth.clear).toHaveBeenCalled()
      expect(request.yar.reset).toHaveBeenCalled()
      expect(h.redirect).toHaveBeenCalledWith(
        `${AUTHORITY_HOST}/${TENANT_ID}/oauth2/v2.0/logout`
      )
    })

    test('Should fall back to "/" when no tenant is configured', () => {
      mockConfig.get.mockImplementation(() => null)
      const { handlers } = register()
      const request = {
        query: {},
        cookieAuth: { clear: vi.fn() },
        yar: { reset: vi.fn() }
      }
      const h = makeH()

      handlers['/auth/logout'].handler(request, h)

      expect(h.redirect).toHaveBeenCalledWith('/')
    })
  })
})
