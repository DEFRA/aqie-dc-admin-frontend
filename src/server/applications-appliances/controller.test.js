import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

const { getApplianceApplicationsMock } = vi.hoisted(() => ({
  getApplianceApplicationsMock: vi.fn()
}))

vi.mock('./applications-data.js', () => ({
  getApplianceApplications: getApplianceApplicationsMock
}))

describe('#Applications appliances Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getApplianceApplicationsMock.mockReset()
    getApplianceApplicationsMock.mockResolvedValue({
      data: { new: [], inProgress: [] }
    })
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/applications-appliances'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })
})
