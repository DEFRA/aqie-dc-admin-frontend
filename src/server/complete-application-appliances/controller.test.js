import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleCompleteApplicationAppliancesRequest,
  handleIncompleteApplicationAppliances
} from './controller.js'

const { getApplicationWithTechStatusMock } = vi.hoisted(() => ({
  getApplicationWithTechStatusMock: vi.fn()
}))

vi.mock('./application-data.js', () => ({
  getApplicationWithTechStatus: getApplicationWithTechStatusMock
}))

const baseApplication = {
  id: 'app-1',
  appliances: {
    unreviewed: [],
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
        appliances: { ...baseApplication.appliances, unreviewed: ['a1'] }
      }
    })

    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/finish-application-review/app-1'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toBe('/application-review-incomplete/app-1')
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

  test('renders the incomplete application page', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        appliances: { ...baseApplication.appliances, unreviewed: ['a1'] }
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/application-review-incomplete/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('is not complete')
  })

  test('renders error view when incomplete page request throws error', async () => {
    getApplicationWithTechStatusMock.mockRejectedValue(
      new Error('backend down')
    )

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/application-review-incomplete/app-1'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleCompleteApplicationAppliancesRequest (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('redirects when there are unreviewed appliances', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        appliances: { ...baseApplication.appliances, unreviewed: ['a1'] }
      }
    })

    const redirect = vi.fn().mockReturnValue('redirected')
    const h = { redirect, view: vi.fn() }

    const result = await handleCompleteApplicationAppliancesRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(redirect).toHaveBeenCalledWith(
      '/application-review-incomplete/app-1'
    )
    expect(h.view).not.toHaveBeenCalled()
    expect(result).toBe('redirected')
  })

  test('renders view with containsBoth true when both accepted and rejected appliances exist', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        appliances: { unreviewed: [], accepted: ['a1'], rejected: ['a2'] }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view, redirect: vi.fn() }

    await handleCompleteApplicationAppliancesRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'complete-application-appliances/index',
      expect.objectContaining({
        applicationId: 'app-1',
        hasPendingReviews: false,
        containsBoth: true
      })
    )
  })

  test('renders view with containsBoth false when only accepted appliances exist', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: {
        ...baseApplication,
        appliances: { unreviewed: [], accepted: ['a1'], rejected: [] }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view, redirect: vi.fn() }

    await handleCompleteApplicationAppliancesRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'complete-application-appliances/index',
      expect.objectContaining({
        containsBoth: false
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

    await handleCompleteApplicationAppliancesRequest(
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

describe('#handleIncompleteApplicationAppliances (unit)', () => {
  beforeEach(() => {
    getApplicationWithTechStatusMock.mockReset()
  })

  test('renders the incomplete view with hasPendingReviews true', async () => {
    getApplicationWithTechStatusMock.mockResolvedValue({
      data: baseApplication
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleIncompleteApplicationAppliances(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'complete-application-appliances/index',
      expect.objectContaining({
        applicationId: 'app-1',
        application: baseApplication,
        hasPendingReviews: true,
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

    await handleIncompleteApplicationAppliances(
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
