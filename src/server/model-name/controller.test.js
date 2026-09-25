import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleModelNameRequest,
  handleModelNameDecisionRequest
} from './controller.js'

const { getApplianceForModelNameMock, saveModelNameMock } = vi.hoisted(() => ({
  getApplianceForModelNameMock: vi.fn(),
  saveModelNameMock: vi.fn()
}))

vi.mock('./model-name-data.js', () => ({
  getApplianceForModelName: getApplianceForModelNameMock,
  saveModelName: saveModelNameMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M40i',
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

describe('#handleModelNameRequest', () => {
  beforeEach(() => {
    getApplianceForModelNameMock.mockReset()
    saveModelNameMock.mockReset()
  })

  test('renders the page with the current model name pre-populated', async () => {
    getApplianceForModelNameMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNameRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'model-name/index',
      expect.objectContaining({
        pageTitle: 'What is the model name?',
        formValue: 'Twin Heat M40i'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForModelNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleModelNameRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleModelNameDecisionRequest', () => {
  beforeEach(() => {
    getApplianceForModelNameMock.mockReset()
    saveModelNameMock.mockReset()
  })

  test('saves the updated model name and redirects to appliance details', async () => {
    saveModelNameMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleModelNameDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelName: '  Twin Heat M40i Pro  ' }
      },
      h
    )

    expect(saveModelNameMock).toHaveBeenCalledWith(
      'APP-1',
      'Twin Heat M40i Pro'
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('re-renders with validation error when model name is empty', async () => {
    getApplianceForModelNameMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNameDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelName: '   ' }
      },
      h
    )

    expect(saveModelNameMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'model-name/index',
      expect.objectContaining({
        pageTitle: 'Error: What is the model name?',
        error: {
          field: 'modelName',
          message: 'Enter the model name',
          href: '#model-name'
        },
        formValue: '   '
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the appliance details page', async () => {
    getApplianceForModelNameMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleModelNameRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'model-name/index',
      expect.objectContaining({
        applianceDetailsHref: '/review-appliance/APP-1/appliance-details'
      })
    )
  })

  test('renders error page when save fails', async () => {
    saveModelNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleModelNameDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { modelName: 'Updated model' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
