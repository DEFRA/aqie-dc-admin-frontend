import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleApplicationReviewCompleteRequest } from './controller.js'

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
    expect(result).toContain('Review complete')
    expect(result).toContain('Your review of application app-1 is complete.')
    expect(result).toContain('href="/review-appliance-application/app-1"')
    expect(result).toContain('href="/appliance-records"')
    expect(result).toContain('href="/manage-certification"')
    expect(result).toContain('Return to appliance applications')
    expect(result).toContain('Go to appliance records')
    expect(result).toContain('Return to dashboard')
  })
})

describe('#handleApplicationReviewCompleteRequest (unit)', () => {
  beforeEach(() => {
    // no-op: keeps the unit test structure consistent with other controller specs
  })

  test('renders the review complete view with the expected content', async () => {
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
          applianceApplicationsLinkText: 'Return to appliance applications',
          applianceRecordsLinkText: 'Go to appliance records',
          dashboardLinkText: 'Return to dashboard'
        })
      })
    )
  })
})
