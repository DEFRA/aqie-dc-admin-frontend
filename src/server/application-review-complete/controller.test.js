import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleApplicationReviewCompleteRequest } from './controller.js'

const { getApplicationWithTechStatusMock } = vi.hoisted(() => ({
  getApplicationWithTechStatusMock: vi.fn()
}))

vi.mock('../finish-application-review/application-data.js', () => ({
  getApplicationWithTechStatus: getApplicationWithTechStatusMock
}))

describe('#Application review complete Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('renders appliance review-complete links for appliance applications', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        id: 'app-1',
        type: 'appliance',
        linkedItems: { accepted: [], rejected: [] }
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/application-review-complete'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Review complete')
    expect(result).toContain('Your review of application app-1 is complete.')
    expect(result).toContain('href="/review-appliance-application/app-1"')
    expect(result).toContain('href="/appliance-records"')
    expect(result).toContain('href="/manage-certification"')
    expect(result).toContain('Return to appliance applications')
    expect(result).toContain('Go to appliance records')
    expect(result).toContain('Return to dashboard')
  })

  test('renders fuel review-complete links for fuel applications', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        id: 'app-1',
        type: 'fuel',
        linkedItems: { accepted: [], rejected: [] }
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/application-review-complete'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('href="/review-fuel-application/app-1"')
    expect(result).toContain('href="/fuel-records"')
    expect(result).toContain('Return to fuel applications')
    expect(result).toContain('Go to fuel records')
  })
})

describe('#handleApplicationReviewCompleteRequest (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('renders the review complete view with appliance content', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        id: 'app-1',
        type: 'appliance',
        linkedItems: { accepted: [], rejected: [] }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleApplicationReviewCompleteRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'application-review-complete/index',
      expect.objectContaining({
        pageTitle: 'Review complete',
        heading: 'Review complete',
        applicationId: 'app-1',
        description: 'Your review of application app-1 is complete.',
        content: expect.objectContaining({
          applicationsLinkText: 'Return to appliance applications',
          recordsLinkText: 'Go to appliance records',
          dashboardLinkText: 'Return to dashboard'
        })
      })
    )
  })

  test('renders error view when backend lookup fails', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const code = vi.fn().mockReturnValue('rendered')
    const view = vi.fn().mockReturnValue({ code })
    const h = { view }

    await handleApplicationReviewCompleteRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        message: 'Sorry, there is a problem with the service'
      })
    )
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
