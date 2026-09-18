import { beforeEach, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleTechnicalDrawingsRequest,
  handleTechnicalDrawingsDecisionRequest
} from './controller.js'

const { getApplianceMock, saveTechnicalDrawingsMock } = vi.hoisted(() => ({
  getApplianceMock: vi.fn(),
  saveTechnicalDrawingsMock: vi.fn()
}))

vi.mock('./technical-drawings-data.js', () => ({
  getAppliance: getApplianceMock,
  saveTechnicalDrawings: saveTechnicalDrawingsMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M20i',
  applicationId: '1084',
  technicalReview: { status: 'in_review' }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleTechnicalDrawingsRequest', () => {
  beforeEach(() => {
    getApplianceMock.mockReset()
    saveTechnicalDrawingsMock.mockReset()
  })

  test('renders the page with the appliance name in the heading', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleTechnicalDrawingsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'technical-drawings/index',
      expect.objectContaining({
        heading: 'Review technical drawings for Twin Heat M20i',
        pageTitle: 'Review technical drawings for Twin Heat M20i'
      })
    )
  })

  test('links cancel back to the review appliance page', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleTechnicalDrawingsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]

    expect(viewModel.reviewHref).toBe('/review-appliance/APP-1')
  })

  test('fetches the appliance by id', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleTechnicalDrawingsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplianceMock).toHaveBeenCalledWith('APP-1')
  })

  test('renders the error view when the backend fails', async () => {
    getApplianceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleTechnicalDrawingsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleTechnicalDrawingsDecisionRequest', () => {
  beforeEach(() => {
    getApplianceMock.mockReset()
    saveTechnicalDrawingsMock.mockReset()
  })

  test('marks the drawings as passed and returns to the review page', async () => {
    saveTechnicalDrawingsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleTechnicalDrawingsDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(saveTechnicalDrawingsMock).toHaveBeenCalledWith('APP-1', true)
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('marks the drawings as failed and returns to the review page', async () => {
    saveTechnicalDrawingsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleTechnicalDrawingsDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'fail' } },
      h
    )

    expect(saveTechnicalDrawingsMock).toHaveBeenCalledWith('APP-1', false)
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('encodes the appliance id in the redirect', async () => {
    saveTechnicalDrawingsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleTechnicalDrawingsDecisionRequest(
      { params: { applianceId: 'APP/1' }, payload: { decision: 'pass' } },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP%2F1')
  })

  test('renders the error view when saving fails', async () => {
    saveTechnicalDrawingsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleTechnicalDrawingsDecisionRequest(
      { params: { applianceId: 'APP-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(h.redirect).not.toHaveBeenCalled()
  })
})
