import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

const { getApplianceApplicationsMock } = vi.hoisted(() => ({
  getApplianceApplicationsMock: vi.fn()
}))
vi.mock('./applications-data.js', () => ({
  getApplianceApplications: getApplianceApplicationsMock
}))

describe('#applianceApplicationsController', () => {
  let server
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should render the page when data loads', async () => {
    getApplianceApplicationsMock.mockResolvedValue({
      data: { new: [], inProgress: [] }
    })
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/appliance-applications'
    })
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should render the error view when the data layer throws (covers the catch)', async () => {
    getApplianceApplicationsMock.mockRejectedValue(new Error('backend down'))
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/appliance-applications'
    })
    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})
