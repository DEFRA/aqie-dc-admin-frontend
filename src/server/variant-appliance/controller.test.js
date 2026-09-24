import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleVariantApplianceRequest,
  handleVariantApplianceDecisionRequest
} from './controller.js'

const { getApplianceForVariantMock, saveVariantApplianceMock } = vi.hoisted(
  () => ({
    getApplianceForVariantMock: vi.fn(),
    saveVariantApplianceMock: vi.fn()
  })
)

vi.mock('./variant-appliance-data.js', () => ({
  getApplianceForVariant: getApplianceForVariantMock,
  saveVariantAppliance: saveVariantApplianceMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M40i',
  isVariant: true,
  existingAuthorisedAppliance: 'Original Twin Heat M40',
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

describe('#handleVariantApplianceRequest', () => {
  beforeEach(() => {
    getApplianceForVariantMock.mockReset()
    saveVariantApplianceMock.mockReset()
  })

  test('renders the page with current variant choice and details pre-populated', async () => {
    getApplianceForVariantMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleVariantApplianceRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        heading: 'Is Twin Heat M40i a variant of a certified appliance?',
        isVariant: true,
        variantDetailsValue: 'Original Twin Heat M40'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForVariantMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleVariantApplianceRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleVariantApplianceDecisionRequest', () => {
  beforeEach(() => {
    getApplianceForVariantMock.mockReset()
    saveVariantApplianceMock.mockReset()
  })

  test('saves Yes choice with variant details and redirects', async () => {
    saveVariantApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          isVariantCS: 'Yes',
          variantDetailsCS: '  Updated variant details  '
        }
      },
      h
    )

    expect(saveVariantApplianceMock).toHaveBeenCalledWith(
      'APP-1',
      true,
      'Updated variant details'
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('saves No choice without variant details and redirects', async () => {
    saveVariantApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'No', variantDetailsCS: '' }
      },
      h
    )

    expect(saveVariantApplianceMock).toHaveBeenCalledWith('APP-1', false, null)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('shows validation error when Yes is selected with empty details', async () => {
    getApplianceForVariantMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'Yes', variantDetailsCS: '   ' }
      },
      h
    )

    expect(saveVariantApplianceMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        error: {
          field: 'variantDetailsCS',
          message: 'Enter details of the certified variant appliance',
          href: '#variant-details'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('shows validation error when details exceed 1000 characters', async () => {
    getApplianceForVariantMock.mockResolvedValue({ data: appliance })
    const h = toolkit()
    const longText = 'a'.repeat(1001)

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'Yes', variantDetailsCS: longText }
      },
      h
    )

    expect(saveVariantApplianceMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        error: expect.objectContaining({
          field: 'variantDetailsCS'
        })
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the appliance details page', async () => {
    getApplianceForVariantMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleVariantApplianceRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        applianceDetailsHref: '/review-appliance/APP-1/appliance-details'
      })
    )
  })

  test('renders error page when save fails', async () => {
    saveVariantApplianceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'Yes', variantDetailsCS: 'Some details' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('pre-fills form with No when appliance is not a variant', async () => {
    const nonVariantAppliance = {
      ...appliance,
      isVariant: false,
      existingAuthorisedAppliance: null
    }
    getApplianceForVariantMock.mockResolvedValue({ data: nonVariantAppliance })
    const h = toolkit()

    await handleVariantApplianceRequest({ params: { applianceId: 'APP-2' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        isVariant: false,
        variantDetailsValue: ''
      })
    )
  })

  test('saves No choice and clears existing variant details', async () => {
    saveVariantApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'No', variantDetailsCS: null }
      },
      h
    )

    expect(saveVariantApplianceMock).toHaveBeenCalledWith('APP-1', false, null)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('encodes special characters in appliance ID in redirect URL', async () => {
    saveVariantApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP/001' },
        payload: { isVariantCS: 'No', variantDetailsCS: '' }
      },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP%2F001/appliance-details'
    )
  })

  test('renders error page with details error message when details exceed max length', async () => {
    getApplianceForVariantMock.mockResolvedValue({ data: appliance })
    const h = toolkit()
    const longText = 'a'.repeat(1050)

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { isVariantCS: 'Yes', variantDetailsCS: longText }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'variant-appliance/index',
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('1000 characters'),
          field: 'variantDetailsCS'
        })
      })
    )
  })

  test('trims whitespace from variant details before saving', async () => {
    saveVariantApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleVariantApplianceDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: {
          isVariantCS: 'Yes',
          variantDetailsCS: '  \n\t  Details here  \n\t  '
        }
      },
      h
    )

    expect(saveVariantApplianceMock).toHaveBeenCalledWith(
      'APP-1',
      true,
      'Details here'
    )
  })
})
