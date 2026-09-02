import { beforeEach, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleApplianceReviewRequest,
  handleApplianceDecisionRequest
} from './controller.js'

const { getApplianceReviewMock, saveApplianceReviewMock } = vi.hoisted(() => ({
  getApplianceReviewMock: vi.fn(),
  saveApplianceReviewMock: vi.fn()
}))

vi.mock('./appliance-data.js', () => ({
  getApplianceReview: getApplianceReviewMock,
  saveApplianceReview: saveApplianceReviewMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M20i',
  applicationId: '1084',
  technicalReview: {
    status: 'in_review',
    documentationReviewed: { testReports: true },
    checksCompleted: {}
  }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleApplianceReviewRequest', () => {
  beforeEach(() => {
    getApplianceReviewMock.mockReset()
    saveApplianceReviewMock.mockReset()
  })

  test('renders the review page with both task lists', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'review-appliance/index',
      expect.objectContaining({
        heading: 'Review Twin Heat M20i',
        documentationTasks: expect.arrayContaining([
          expect.objectContaining({ title: { text: 'Review test reports' } })
        ]),
        listingTasks: expect.arrayContaining([
          expect.objectContaining({
            title: { text: 'Check appliance details' }
          })
        ])
      })
    )
  })

  test('builds breadcrumbs back to the application', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]

    expect(viewModel.breadcrumbs).toEqual([
      { text: 'Home', href: '/dashboard' },
      { text: 'Appliance applications', href: '/applications-appliances' },
      {
        text: 'Review appliance application 1084',
        href: '/review-appliance-application/1084'
      },
      { text: 'Review Twin Heat M20i' }
    ])
  })

  test('renders the error view when the backend fails', async () => {
    getApplianceReviewMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleApplianceDecisionRequest', () => {
  beforeEach(() => {
    getApplianceReviewMock.mockReset()
    saveApplianceReviewMock.mockReset()
  })

  test('accepts the appliance and redirects to the application', async () => {
    saveApplianceReviewMock.mockResolvedValue({ success: true })
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'accept' } },
      h
    )

    expect(saveApplianceReviewMock).toHaveBeenCalledWith(
      'APP-1',
      'accepted',
      undefined
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance-application/1084'
    )
  })

  test('rejects the appliance and redirects to the application', async () => {
    saveApplianceReviewMock.mockResolvedValue({ success: true })
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'reject' } },
      h
    )

    expect(saveApplianceReviewMock).toHaveBeenCalledWith(
      'APP-1',
      'rejected',
      undefined
    )
  })

  test('passes the signed-in reviewer to the backend', async () => {
    saveApplianceReviewMock.mockResolvedValue({ success: true })
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { decision: 'accept' },
        auth: {
          credentials: {
            profile: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
          }
        }
      },
      h
    )

    expect(saveApplianceReviewMock).toHaveBeenCalledWith('APP-1', 'accepted', {
      name: 'A Reviewer',
      email: 'a@defra.gov.uk'
    })
  })

  test('re-renders with an error when checks are outstanding', async () => {
    const conflict = new Error('Backend PATCH failed: 409')
    conflict.status = statusCodes.conflict
    saveApplianceReviewMock.mockRejectedValue(conflict)
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'accept' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'review-appliance/index',
      expect.objectContaining({
        incompleteError:
          'You cannot accept this appliance until every check has been completed and passed.'
      })
    )
    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders the error view on any other backend failure', async () => {
    saveApplianceReviewMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'accept' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
