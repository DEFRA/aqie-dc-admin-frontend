import { vi } from 'vitest'

import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

vi.mock('../../config/azure-auth.js', () => ({
  msalClient: vi.fn()
}))

const { msalClient } = await import('../../config/azure-auth.js')

describe('#azureAuth plugin', () => {
  let server
  let mockMsal

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    mockMsal = {
      getAuthCodeUrl: vi.fn(),
      acquireTokenByCode: vi.fn()
    }
    msalClient.mockReturnValue(mockMsal)
  })

  describe('GET /auth/login', () => {
    test('redirects the user to the URL returned by getAuthCodeUrl', async () => {
      const authorizeUrl =
        'https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize?fake'
      mockMsal.getAuthCodeUrl.mockResolvedValue(authorizeUrl)

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/auth/login'
      })

      expect(statusCode).toBe(statusCodes.found ?? 302)
      expect(headers.location).toBe(authorizeUrl)
      expect(mockMsal.getAuthCodeUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          scopes: ['openid', 'profile', 'email'],
          responseMode: 'form_post'
        })
      )
    })

    test('redirects to /error when getAuthCodeUrl throws', async () => {
      mockMsal.getAuthCodeUrl.mockRejectedValue(new Error('AAD unreachable'))

      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/auth/login'
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe('/error')
    })
  })

  describe('POST /auth/callback', () => {
    test('redirects to /home and acquires a token with the posted code', async () => {
      mockMsal.acquireTokenByCode.mockResolvedValue({
        account: {
          homeAccountId: 'oid-123',
          username: 'user@example.com',
          name: 'Test User'
        }
      })

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: '/auth/callback',
        payload: { code: 'test-auth-code' }
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe('/home')
      expect(mockMsal.acquireTokenByCode).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'test-auth-code',
          scopes: ['openid', 'profile', 'email']
        })
      )
    })

    test('redirects to /error when token acquisition fails', async () => {
      mockMsal.acquireTokenByCode.mockRejectedValue(new Error('bad code'))

      const { statusCode, headers } = await server.inject({
        method: 'POST',
        url: '/auth/callback',
        payload: { code: 'bad-code' }
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toBe('/error')
    })
  })

  describe('GET /auth/logout', () => {
    test('redirects to the Microsoft logout endpoint', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/auth/logout'
      })

      expect(statusCode).toBe(302)
      expect(headers.location).toMatch(
        /^https:\/\/login\.microsoftonline\.com\/.*\/oauth2\/v2\.0\/logout$/
      )
    })
  })
})
