import { vi } from 'vitest'

const OK = 200
const REDIRECT = 302

// resetModules + stubEnv forces config.js to re-read SSO_ENABLED per boot
// (convict locks env values at import time).
async function bootServer(ssoEnabled) {
  vi.stubEnv('SSO_ENABLED', ssoEnabled ? 'true' : 'false')
  vi.resetModules()
  const { createServer } = await import('./server.js')
  const server = await createServer()
  // A route the test owns, protected by the default auth strategy.
  // Added after createServer() so it inherits server.auth.default (required).
  server.route({
    method: 'GET',
    path: '/__auth-probe',
    handler: () => 'ok'
  })

  await server.initialize()
  return server
}

describe('#createServer', () => {
  describe('When SSO is enabled (CDP)', () => {
    let server

    beforeAll(async () => {
      server = await bootServer(true)
    }, 30000)

    afterAll(async () => {
      await server.stop({ timeout: 0 })
      vi.unstubAllEnvs()
    })

    test('Should keep /health public', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/health'
      })
      expect(statusCode).toBe(OK)
    })

    test('Should redirect an unauthenticated request for a protected page to /auth/login', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/__auth-probe'
      })
      expect(statusCode).toBe(REDIRECT)
      expect(headers.location).toBe('/auth/login')
    })

    test('Should allow an authenticated request through to the protected page', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/__auth-probe',
        auth: {
          strategy: 'session',
          credentials: {
            isAuthenticated: true,
            user: { id: 'o', email: 'a@defra.gov.uk', name: 'Admin' }
          }
        }
      })
      expect(statusCode).toBe(OK)
    })
  })

  describe('When SSO is disabled (local dev bypass)', () => {
    let server

    beforeAll(async () => {
      server = await bootServer(false)
    }, 30000)

    afterAll(async () => {
      await server.stop({ timeout: 0 })
      vi.unstubAllEnvs()
    })

    test('Should reach protected pages without signing in, using the stub user', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/__auth-probe'
      })
      expect(statusCode).toBe(OK)
    })
  })
})
