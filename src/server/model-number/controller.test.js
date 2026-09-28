import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleModelNumberRequest,
  handleModelNumberDecisionRequest
} from './controller.js'

const { getApplianceForModelNumberMock, saveModelNumberMock } = vi.hoisted(
  () => ({
    getApplianceForModelNumberMock: vi.fn(),
    saveModelNumberMock: vi.fn()
  })
)

vi.mock('./model-number-data.js', () => ({
  getApplianceForModelNumber: getApplianceForModelNumberMock,
  saveModelNumber: saveModelNumberMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M40i',
  modelNumber: 'M40i-2024',
  technicalReview: {
    status: 'in_review',
    listingChecks: { applianceDetails: null }
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

describe('#handleModelNumberRequest', () => {
  beforeEach(() => {
    getApplianceForModelNumberMock.mockReset()
    saveModelNumberMock.mockReset()
  })

  test('renders the page with the current model number pre-populated', async () => {
    getApplianceForModelNumberMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNumberRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledTimes(1)
    expect(h.view.mock.calls[0][0]).toBe('model-number/index')
    expect(h.view.mock.calls[0][1]).toMatchObject({
      pageTitle: 'What is the model number?',
      formValue: 'M40i-2024'
    })
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForModelNumberMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleModelNumberRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleModelNumberDecisionRequest', () => {
  beforeEach(() => {
    getApplianceForModelNumberMock.mockReset()
    saveModelNumberMock.mockReset()
  })

  test('saves the updated model number and redirects to appliance details', async () => {
    saveModelNumberMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleModelNumberDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelNumber: '  M40i-2025  ' }
      },
      h
    )

    expect(saveModelNumberMock).toHaveBeenCalledWith('APP-1', 'M40i-2025')
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('re-renders with validation error when model number is empty', async () => {
    getApplianceForModelNumberMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNumberDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelNumber: '   ' }
      },
      h
    )

    expect(saveModelNumberMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledTimes(1)
    expect(h.view.mock.calls[0][0]).toBe('model-number/index')
    expect(h.view.mock.calls[0][1]).toMatchObject({
      pageTitle: 'Error: What is the model number?',
      error: {
        field: 'modelNumber',
        message: 'Enter the model number',
        href: '#model-number'
      },
      formValue: '   '
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the appliance details page', async () => {
    getApplianceForModelNumberMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNumberRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledTimes(1)
    expect(h.view.mock.calls[0][0]).toBe('model-number/index')
    expect(h.view.mock.calls[0][1]).toMatchObject({
      applianceDetailsHref: '/review-appliance/APP-1/appliance-details'
    })
  })

  test('renders error page when save fails', async () => {
    saveModelNumberMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleModelNumberDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelNumber: 'Updated model number' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
