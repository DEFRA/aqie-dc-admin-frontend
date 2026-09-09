import { vi } from 'vitest'
import { conformityMarkController as controller } from './controller.js'

const { getApplianceReviewMock, saveConformityMarkResultMock } = vi.hoisted(
  () => ({
    getApplianceReviewMock: vi.fn(),
    saveConformityMarkResultMock: vi.fn()
  })
)

vi.mock('../review-appliance/appliance-data.js', () => ({
  getApplianceReview: getApplianceReviewMock
}))

vi.mock('./conformity-mark-data.js', () => ({
  saveConformityMarkResult: saveConformityMarkResultMock
}))

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Twin Heat CS200i',
  applicationId: '1083',
  technicalReview: { documentationChecks: {} }
}

describe('review-conformity controller', () => {
  beforeEach(() => {
    getApplianceReviewMock.mockReset()
    saveConformityMarkResultMock.mockReset()
  })

  test('GET renders the page', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await controller.get({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'conformity-mark/index',
      expect.objectContaining({
        heading: 'Review conformity mark details for Twin Heat CS200i'
      })
    )
  })

  test('GET returns error view on backend failure', async () => {
    getApplianceReviewMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.get({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })

  test('POST records the pass result and redirects to review page (pass)', async () => {
    saveConformityMarkResultMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(saveConformityMarkResultMock).toHaveBeenCalledWith('APP-1', true)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1?confstatusCS=pass'
    )
  })

  test('POST records the fail result and redirects to review page (fail)', async () => {
    saveConformityMarkResultMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'fail' } },
      h
    )

    expect(saveConformityMarkResultMock).toHaveBeenCalledWith('APP-1', false)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1?confstatusCS=fail'
    )
  })

  test('POST returns error view on backend failure', async () => {
    saveConformityMarkResultMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.post(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })
})
