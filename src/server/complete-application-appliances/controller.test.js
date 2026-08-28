import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#Complete application appliances Controller', () => {
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
      url: '/complete-appliance-application/123'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })
})
