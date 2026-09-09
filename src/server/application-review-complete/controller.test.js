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

})
