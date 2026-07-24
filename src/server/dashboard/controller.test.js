import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleDashboard } from './controller.js'

const { getCountsMock } = vi.hoisted(() => ({
  getCountsMock: vi.fn()
}))

vi.mock('./dashboard-data.js', () => ({
  getCounts: getCountsMock
}))

describe('#dashboardController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getCountsMock.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the dashboard with counts from the data layer', async () => {
    getCountsMock.mockResolvedValue({
      data: {
        appliance: { new: 5, inProgress: 7, records: 3359 },
        fuel: { new: 2, inProgress: 1, records: 265 }
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/dashboard'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Dashboard')
  })

  test('renders error view when getCounts throws error', async () => {
    getCountsMock.mockRejectedValue(new Error('backend down'))

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/dashboard'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleDashboardGet (unit)', () => {
  beforeEach(() => {
    getCountsMock.mockReset()
  })

  test('passes counts from getCounts into the view', async () => {
    getCountsMock.mockResolvedValue({
      data: {
        appliance: { new: 1, inProgress: 2, records: 3 },
        fuel: { new: 4, inProgress: 5, records: 6 }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = {
      view,
      code: vi.fn()
    }

    await handleDashboard({}, h)

    expect(view).toHaveBeenCalledWith(
      'dashboard/index',
      expect.objectContaining({
        applianceNewCount: 1,
        applianceInProgressCount: 2,
        applianceTotalRecordCount: 3,
        fuelNewCount: 4,
        fuelInProgressCount: 5,
        fuelTotalRecordCount: 6
      })
    )
  })
})
