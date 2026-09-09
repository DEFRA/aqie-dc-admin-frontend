import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#Application review complete Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the application review complete page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/application-review-complete/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Application review complete')
    expect(result).toContain('app-1')
  })
})
