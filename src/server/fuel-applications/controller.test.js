import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

const { getFuelApplicationsMock, startFuelApplicationReviewMock } = vi.hoisted(
  () => ({
    getFuelApplicationsMock: vi.fn(),
    startFuelApplicationReviewMock: vi.fn()
  })
)

vi.mock('./fuel-applications-data.js', () => ({
  getFuelApplications: getFuelApplicationsMock,
  startFuelApplicationReview: startFuelApplicationReviewMock
}))

describe('#fuelApplicationsController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getFuelApplicationsMock.mockReset()
    startFuelApplicationReviewMock.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the fuel applications page when data loads', async () => {
    getFuelApplicationsMock.mockResolvedValue({
      data: {
        new: [{ id: 'app-1', items: [{ name: 'Fuels' }] }],
        inProgress: []
      }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/fuel-applications'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toContain('Fuel applications')
  })

  test('renders the fuel applications page with safe empty arrays when the backend payload is malformed', async () => {
    getFuelApplicationsMock.mockResolvedValue({
      data: {
        new: 'not-an-array',
        inProgress: undefined
      }
    })

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/fuel-applications'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toContain('Fuel applications')
  })

  test('renders the error view when the backend response is missing data', async () => {
    getFuelApplicationsMock.mockResolvedValue(null)

    const { statusCode, payload } = await server.inject({
      method: 'GET',
      url: '/fuel-applications'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
    expect(payload).toContain('Sorry, there is a problem with the service')
  })

  test('redirects to the fuel application details page when the start review action is called', async () => {
    startFuelApplicationReviewMock.mockResolvedValue({ success: true })

    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel-application/app-1/start',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      }
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/review-fuel-application/app-1')
  })

  test('redirects to the fuel application details page when the review is already in progress', async () => {
    startFuelApplicationReviewMock.mockRejectedValue({
      status: statusCodes.conflict
    })

    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel-application/app-1/start',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      }
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/review-fuel-application/app-1')
  })

  test('renders the error view when the data layer throws', async () => {
    getFuelApplicationsMock.mockRejectedValue(new Error('backend down'))

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/fuel-applications'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })

  test('rejects invalid application identifiers before starting the review', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel-application/invalid id/start',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      }
    })

    expect(response.statusCode).toBe(statusCodes.badRequest)
  })

  test('falls back to default reviewer metadata when auth user details are incomplete', async () => {
    startFuelApplicationReviewMock.mockResolvedValue({ success: true })

    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel-application/app-1/start',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com' }
        }
      }
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/review-fuel-application/app-1')
    expect(startFuelApplicationReviewMock).toHaveBeenCalledWith('app-1', {
      name: 'Unknown reviewer',
      email: 'test@yopmail.com'
    })
  })
})
