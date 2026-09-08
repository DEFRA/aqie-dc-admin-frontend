import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#Applications appliances Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/applications-appliances',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
  })
})
