import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleIncompleteApplicationReviewRequest } from './controller.js'

const { getApplicationWithTechStatusMock } = vi.hoisted(() => ({
  getApplicationWithTechStatusMock: vi.fn()
}))

vi.mock('../finish-application-review/application-data.js', () => ({
  getApplicationWithTechStatus: getApplicationWithTechStatusMock
}))

const baseApplication = {
  id: 'app-1',
  applicationReviewComplete: false,
  linkedItems: {
    accepted: [],
    rejected: []
  }
}

describe('#Incomplete application review Controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the incomplete application page', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: baseApplication
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/incomplete-application-review/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('is not complete')
  })

  test('renders error view when getApplicationWithTechStatus throws error', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/incomplete-application-review/app-1'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleIncompleteApplicationReviewRequest (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('renders the incomplete view', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: baseApplication
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleIncompleteApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'incomplete-application-review/index',
      expect.objectContaining({
        applicationId: 'app-1',
        application: baseApplication,
        heading: 'Your review of application app-1 is not complete',
        pageTitle: 'Your review of application app-1 is not complete'
      })
    )
  })

  test('renders error view when getApplicationWithTechStatus throws', async () => {
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

    expect(view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        message: 'Sorry there is a problem with the service'
      })
    )
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
