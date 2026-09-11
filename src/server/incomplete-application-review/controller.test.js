import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleIncompleteApplicationReviewRequest } from './controller.js'

describe('#Incomplete application review Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the incomplete application page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/incomplete-application-review/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('is not complete')
    expect(result).toContain(
      'You must make a final decision on each appliance before completing this application review.'
    )
    expect(result).toContain('href="/review-appliance-application/app-1"')
    expect(result).toContain('Return to application and complete reviews')
  })
})

describe('#handleIncompleteApplicationReviewRequest (unit)', () => {
  test('renders the incomplete view', () => {
    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    handleIncompleteApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'incomplete-application-review/index',
      expect.objectContaining({
        applicationId: 'app-1',
        heading: 'Your review of application app-1 is not complete',
        pageTitle: 'Your review of application app-1 is not complete',
        introText:
          'You must make a final decision on each appliance before completing this application review.',
        returnLink: '/review-appliance-application/app-1',
        returnLinkText: 'Return to application and complete reviews'
      })
    )
  })
})
