import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleIncompleteApplicationReviewRequest } from './controller.js'

const { getApplicationWithTechStatusMock } = vi.hoisted(() => ({
  getApplicationWithTechStatusMock: vi.fn()
}))

vi.mock('../finish-application-review/application-data.js', () => ({
  getApplicationWithTechStatus: getApplicationWithTechStatusMock
}))

describe('#Incomplete application review Controller', () => {
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

  test('renders the incomplete appliance application page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/incomplete-application-review?type=appliance'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Review is not complete')
    expect(result).toContain(
      'You must make a final decision on the appliance before completing your review.'
    )
    expect(result).toContain('href="/review-appliance-application/app-1"')
    expect(result).toContain('Return to application review')
    expect(getApplicationWithTechStatusMock).not.toHaveBeenCalled()
  })

  test('renders the incomplete fuel application page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/incomplete-application-review?type=fuel'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Review is not complete')
    expect(result).toContain(
      'You must make a final decision on the fuel before completing your review.'
    )
    expect(result).toContain('href="/review-fuel-application/app-1"')
    expect(result).toContain('Return to fuel review')
    expect(getApplicationWithTechStatusMock).not.toHaveBeenCalled()
  })

  test('falls back to backend lookup when type query is not provided', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: { id: 'app-1', type: 'fuel' }
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/incomplete-application-review'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(getApplicationWithTechStatusMock).toHaveBeenCalledWith('app-1')
  })

  test('renders generic error page when backend returns unsupported application type', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: { id: 'app-1', type: 'unsupported' }
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1/incomplete-application-review'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleIncompleteApplicationReviewRequest (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('renders the incomplete appliance view using the query type', async () => {
    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleIncompleteApplicationReviewRequest(
      { params: { applicationId: 'app-1' }, query: { type: 'appliance' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'incomplete-application-review/index',
      expect.objectContaining({
        applicationId: 'app-1',
        heading: 'Review is not complete',
        pageTitle: 'Review is not complete',
        introText:
          'You must make a final decision on the appliance before completing your review.',
        returnLink: '/review-appliance-application/app-1',
        returnLinkText: 'Return to application review'
      })
    )

    expect(getApplicationWithTechStatusMock).not.toHaveBeenCalled()
  })

  test('renders the generic error page when application type lookup fails', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const code = vi.fn().mockReturnValue('rendered')
    const view = vi.fn().mockReturnValue({ code })
    const h = { view }

    await handleIncompleteApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
