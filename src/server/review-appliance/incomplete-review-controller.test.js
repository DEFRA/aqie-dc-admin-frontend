import { beforeEach, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleIncompleteReviewRequest } from './incomplete-review-controller.js'

const { getApplianceReviewMock } = vi.hoisted(() => ({
  getApplianceReviewMock: vi.fn()
}))

vi.mock('./appliance-data.js', () => ({
  getApplianceReview: getApplianceReviewMock,
  saveApplianceReview: vi.fn()
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M20i',
  applicationId: '1084'
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleIncompleteReviewRequest', () => {
  beforeEach(() => {
    getApplianceReviewMock.mockReset()
  })

  test('renders the page naming the appliance and linking back to its review', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleIncompleteReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'review-appliance/incomplete-review',
      expect.objectContaining({
        heading: 'Incomplete review',
        intro:
          'You cannot accept Twin Heat M20i for government approval until:',
        returnLinkText: 'Return to Twin Heat M20i review',
        applianceHref: '/review-appliance/APP-1',
        backLink: { href: '/review-appliance/APP-1' }
      })
    )
  })

  test('breadcrumb trail ends with a link back to the appliance review', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleIncompleteReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    const { breadcrumbs } = h.view.mock.calls[0][1]

    expect(breadcrumbs.at(-1)).toEqual({
      text: 'Review Twin Heat M20i',
      href: '/review-appliance/APP-1'
    })
  })

  test('renders the error view when the appliance cannot be loaded', async () => {
    getApplianceReviewMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleIncompleteReviewRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
