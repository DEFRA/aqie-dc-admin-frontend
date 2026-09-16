import { beforeEach, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleAdditionalConditionsRequest,
  handleAdditionalConditionsDecisionRequest
} from './controller.js'

const { getApplianceMock, saveAdditionalConditionsMock } = vi.hoisted(() => ({
  getApplianceMock: vi.fn(),
  saveAdditionalConditionsMock: vi.fn()
}))

vi.mock('./additional-conditions-data.js', () => ({
  getAppliance: getApplianceMock,
  saveAdditionalConditions: saveAdditionalConditionsMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat CS200i',
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

describe('#handleAdditionalConditionsRequest', () => {
  beforeEach(() => {
    getApplianceMock.mockReset()
    saveAdditionalConditionsMock.mockReset()
  })

  test('renders the additional conditions page with the appliance name in the heading', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-conditions/index',
      expect.objectContaining({
        heading: 'Enter additional conditions for Twin Heat CS200i',
        pageTitle: 'Enter additional conditions for Twin Heat CS200i'
      })
    )
  })

  test('pre-populates the saved additional conditions from the appliance record', async () => {
    getApplianceMock.mockResolvedValue({
      data: { ...appliance, additionalConditions: 'Existing saved condition' }
    })
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-conditions/index',
      expect.objectContaining({
        additionalConditionsValue: 'Existing saved condition'
      })
    )
  })

  test('uses an empty string when there is no saved additional conditions value', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-conditions/index',
      expect.objectContaining({
        additionalConditionsValue: ''
      })
    )
  })

  test('links cancel back to the review appliance page', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]

    expect(viewModel.reviewHref).toBe('/review-appliance/APP-1')
  })

  test('encodes the review link for appliance ids containing a slash', async () => {
    getApplianceMock.mockResolvedValue({
      data: { ...appliance, id: 'APP/1', modelName: 'Twin Heat CS200i' }
    })
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP/1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]

    expect(viewModel.reviewHref).toBe('/review-appliance/APP%2F1')
  })

  test('shows the empty-field validation message when the textarea is blank', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'complete',
          additionalConditions: '   '
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-conditions/index',
      expect.objectContaining({
        errorMessage: {
          text: 'Enter additional conditions for use or enter “No additional conditions for use”'
        },
        additionalConditionsValue: '   ',
        reviewHref: '/review-appliance/APP-1'
      })
    )
    expect(h.code).toHaveBeenCalledWith(400)
    expect(saveAdditionalConditionsMock).not.toHaveBeenCalled()
  })

  test('shows the over-limit character count error when the textarea exceeds 1000 characters', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    saveAdditionalConditionsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'complete',
          additionalConditions: 'a'.repeat(1001)
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-conditions/index',
      expect.objectContaining({
        errorMessage: { text: 'You have 1 character too many' },
        additionalConditionsValue: 'a'.repeat(1001),
        reviewHref: '/review-appliance/APP-1'
      })
    )
    expect(h.code).toHaveBeenCalledWith(400)
    expect(saveAdditionalConditionsMock).not.toHaveBeenCalled()
  })

  test('renders the error view when the backend fails', async () => {
    getApplianceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleAdditionalConditionsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleAdditionalConditionsDecisionRequest', () => {
  beforeEach(() => {
    getApplianceMock.mockReset()
    saveAdditionalConditionsMock.mockReset()
  })

  test('marks the check as completed and persists the entered text', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    saveAdditionalConditionsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'complete',
          additionalConditions: 'Standard additional condition text'
        }
      },
      h
    )

    expect(saveAdditionalConditionsMock).toHaveBeenCalledWith(
      'APP-1',
      'Standard additional condition text'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('encodes the appliance id in the redirect', async () => {
    getApplianceMock.mockResolvedValue({ data: { ...appliance, id: 'APP/1' } })
    saveAdditionalConditionsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP/1' },
        payload: {
          decision: 'complete',
          additionalConditions: 'Standard additional condition text'
        }
      },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP%2F1')
  })

  test('trims the input before persisting the additional conditions text', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    saveAdditionalConditionsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'complete',
          additionalConditions: '  Standard additional condition text  '
        }
      },
      h
    )

    expect(saveAdditionalConditionsMock).toHaveBeenCalledWith(
      'APP-1',
      'Standard additional condition text'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('returns the service error when the decision is not complete', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'accept',
          additionalConditions: 'Standard additional condition text'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(saveAdditionalConditionsMock).not.toHaveBeenCalled()
  })

  test('renders the error view when saving fails', async () => {
    getApplianceMock.mockResolvedValue({ data: appliance })
    saveAdditionalConditionsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleAdditionalConditionsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          decision: 'complete',
          additionalConditions: 'Standard additional condition text'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(h.redirect).not.toHaveBeenCalled()
  })
})
