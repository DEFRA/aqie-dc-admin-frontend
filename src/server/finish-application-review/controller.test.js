import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFinishApplicationReviewRequest,
  handleFinishApplicationReviewSubmitRequest
} from './controller.js'
import { finishApplicationReviewContent } from './content.js'

const { getApplicationWithTechStatusMock, completeApplicationMock } =
  vi.hoisted(() => ({
    getApplicationWithTechStatusMock: vi.fn(),
    completeApplicationMock: vi.fn()
  }))

vi.mock('./application-data.js', () => ({
  getApplicationWithTechStatus: getApplicationWithTechStatusMock,
  completeApplication: completeApplicationMock
}))

const baseApplication = {
  id: 'app-1',
  applicationReviewComplete: true,
  linkedItems: {
    accepted: [],
    rejected: []
  }
}

describe('#Complete application appliances Controller', () => {
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

  test('renders the complete application page when there are no pending reviews', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: baseApplication
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/finish-application-review/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Finish Application Review')
  })

  test('redirects to the incomplete page when there are pending reviews', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        applicationReviewComplete: false
      }
    })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/finish-application-review/app-1'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toBe('/incomplete-application-review/app-1')
  })

  test('renders error view when getApplicationWithTechStatus throws error', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/finish-application-review/app-1'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleFinishApplicationReviewRequest (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('redirects when the application review is not complete', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        applicationReviewComplete: false
      }
    })

    const redirect = vi.fn().mockReturnValue('redirected')
    const h = { redirect, view: vi.fn() }

    const result = await handleFinishApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(redirect).toHaveBeenCalledWith(
      '/incomplete-application-review/app-1'
    )
    expect(h.view).not.toHaveBeenCalled()
    expect(result).toBe('redirected')
  })

  test('renders view with containsBoth true when both accepted and rejected appliances exist', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: { accepted: ['a1'], rejected: ['a2'] }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view, redirect: vi.fn() }

    await handleFinishApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'finish-application-review/index',
      expect.objectContaining({
        applicationId: 'app-1',
        containsBoth: true
      })
    )
  })

  test('renders view with containsBoth false when only accepted appliances exist', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: { accepted: ['a1'], rejected: [] }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view, redirect: vi.fn() }

    await handleFinishApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'finish-application-review/index',
      expect.objectContaining({
        containsBoth: false
      })
    )
  })

  test('passes the content copy through the view model', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: baseApplication
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view, redirect: vi.fn() }

    await handleFinishApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'finish-application-review/index',
      expect.objectContaining({
        content: expect.objectContaining({
          unsuitableAppliancesHeading: 'Unsuitable appliances',
          finishReviewButton: 'Finish Review',
          submitForApprovalButton: 'Submit for approval'
        })
      })
    )
  })

  test('renders error view when getApplicationWithTechStatus throws', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const code = vi.fn().mockReturnValue('rendered')
    const view = vi.fn().mockReturnValue({ code })
    const h = { view, redirect: vi.fn() }

    await handleFinishApplicationReviewRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        message: finishApplicationReviewContent.en.errors.generic
      })
    )
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleFinishApplicationReviewSubmitRequest (unit)', () => {
  beforeEach(() => {
    completeApplicationMock.mockReset()
  })

  function toolkit() {
    const code = vi.fn().mockReturnValue('rendered')
    const view = vi.fn().mockReturnValue({ code })
    return { view, redirect: vi.fn(), code }
  }

  test('passes the signed-in reviewer to the backend and redirects on success', async () => {
    completeApplicationMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleFinishApplicationReviewSubmitRequest(
      {
        params: { applicationId: 'app-1' },
        auth: {
          credentials: {
            user: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
          }
        }
      },
      h
    )

    expect(completeApplicationMock).toHaveBeenCalledWith('app-1', {
      name: 'A Reviewer',
      email: 'a@defra.gov.uk'
    })
    expect(h.redirect).toHaveBeenCalledWith(
      '/application-review-complete/app-1'
    )
  })

  test('passes an undefined reviewer to the backend when nobody is signed in', async () => {
    completeApplicationMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleFinishApplicationReviewSubmitRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(completeApplicationMock).toHaveBeenCalledWith('app-1', undefined)
    expect(h.redirect).toHaveBeenCalledWith(
      '/application-review-complete/app-1'
    )
  })

  test('redirects to the incomplete review page when the backend refuses with a conflict', async () => {
    const conflict = new Error('Backend PATCH failed: 409')
    conflict.status = statusCodes.conflict
    completeApplicationMock.mockRejectedValue(conflict)
    const h = toolkit()

    await handleFinishApplicationReviewSubmitRequest(
      {
        params: { applicationId: 'app-1' },
        auth: {
          credentials: {
            user: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
          }
        }
      },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/incomplete-application-review/app-1'
    )
    expect(h.view).not.toHaveBeenCalled()
  })

  test('renders the error view on any other backend failure', async () => {
    completeApplicationMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFinishApplicationReviewSubmitRequest(
      {
        params: { applicationId: 'app-1' },
        auth: {
          credentials: {
            user: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
          }
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: finishApplicationReviewContent.en.errors.generic
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
