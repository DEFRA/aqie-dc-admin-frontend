import { createServer } from '../../server.js'

describe('#contentSecurityPolicy', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should set the CSP policy header', async () => {
    const resp = await server.inject({
      method: 'GET',
      url: '/',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: {
            id: '3',
            email: 'local.test@yopmail.com',
            name: 'John doe'
          }
        }
      }
    })

    expect(resp.headers['content-security-policy']).toBeDefined()
  })
})
