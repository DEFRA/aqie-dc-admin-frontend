import { vi } from 'vitest'

const { getApplianceReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getApplianceReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../review-appliance/appliance-data.js', () => ({
  getApplianceReview: getApplianceReviewMock
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

import { reviewConformityController as controller } from './controller.js'

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
    patchJsonMock.mockReset()
  })

  test('GET renders the page', async () => {
    getApplianceReviewMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await controller.get({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('review-conformity-mark/index',
      expect.objectContaining({ heading: 'Review conformity mark details for Twin Heat CS200i' })
    )
  })

  test('GET returns error view on backend failure', async () => {
    getApplianceReviewMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.get({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', { message: 'Sorry, there is a problem with the service' })
  })

  test('POST patches the backend and redirects to review page (pass)', async () => {
    patchJsonMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post({ params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } }, h)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1/technical-review', { documentationChecks: { conformityMark: true } })
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1?confstatusCS=pass')
  })

  test('POST patches the backend and redirects to review page (fail)', async () => {
    patchJsonMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post({ params: { applianceId: 'APP-1' }, payload: { decision: 'fail' } }, h)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1/technical-review', { documentationChecks: { conformityMark: false } })
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1?confstatusCS=fail')
  })

  test('POST returns error view on backend failure', async () => {
    patchJsonMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.post({ params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', { message: 'Sorry, there is a problem with the service' })
  })
})
