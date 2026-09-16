import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleCheckApplianceDetailsRequest,
  handleMarkCheckApplianceDetailsRequest
} from './controller.js'

const { getApplianceForCheckDetailsMock, markApplianceDetailsCompletedMock } =
  vi.hoisted(() => ({
    getApplianceForCheckDetailsMock: vi.fn(),
    markApplianceDetailsCompletedMock: vi.fn()
  }))

vi.mock('./appliance-details-data.js', () => ({
  getApplianceForCheckDetails: getApplianceForCheckDetailsMock,
  markApplianceDetailsCompleted: markApplianceDetailsCompletedMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M40i',
  modelNumber: null,
  applianceType: 'boiler',
  isVariant: false,
  nominalOutput: 2,
  multifuelAppliance: true,
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

describe('#handleCheckApplianceDetailsRequest', () => {
  beforeEach(() => {
    getApplianceForCheckDetailsMock.mockReset()
    markApplianceDetailsCompletedMock.mockReset()
  })

  test('renders page heading and summary rows', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-details/index',
      expect.objectContaining({
        heading: 'Check appliance details for Twin Heat M40i'
      })
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryItems).toHaveLength(6)
    expect(viewModel.summaryItems[1].value.text).toBe('Not provided')
    expect(viewModel.summaryItems[1].actions.items[0].text).toBe('Add')
    expect(viewModel.summaryItems[2].value.text).toBe('Boiler')
    expect(viewModel.summaryItems[4].value.text).toBe('2 kW')
    expect(viewModel.summaryItems[5].value.text).toBe('Yes')
  })

  test('uses change action when model number exists', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({
      data: { ...appliance, modelNumber: 'M40i-2024' }
    })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryItems[1].actions.items[0].text).toBe('Change')
    expect(viewModel.summaryItems[1].value.text).toBe('M40i-2024')
  })

  test('includes Other appliance type row when applianceType is other', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({
      data: { ...appliance, applianceType: 'other' }
    })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryItems).toHaveLength(7)
    const otherTypeRow = viewModel.summaryItems.find(
      (row) => row.key.text === 'Other appliance type'
    )
    expect(otherTypeRow).toBeDefined()
    expect(otherTypeRow.value.html).toContain('appliance-type-other')
    expect(otherTypeRow.value.html).toContain('Select')
  })

  test('includes Variant details row when isVariant is true', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({
      data: {
        ...appliance,
        isVariant: true,
        existingAuthorisedAppliance: 'Model XYZ'
      }
    })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryItems).toHaveLength(7)
    const variantRow = viewModel.summaryItems.find(
      (row) => row.key.text === 'Variant details'
    )
    expect(variantRow).toBeDefined()
    expect(variantRow.value.text).toBe('Model XYZ')
    expect(variantRow.actions.items[0].text).toBe('Change')
  })

  test('shows Not provided for variant details when isVariant is true but no details exist', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({
      data: { ...appliance, isVariant: true }
    })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const variantRow = viewModel.summaryItems.find(
      (row) => row.key.text === 'Variant details'
    )
    expect(variantRow.value.text).toBe('Not provided')
    expect(variantRow.actions).toBeUndefined()
  })

  test('includes both conditional rows when applianceType is other and isVariant is true', async () => {
    getApplianceForCheckDetailsMock.mockResolvedValue({
      data: {
        ...appliance,
        applianceType: 'other',
        isVariant: true,
        existingAuthorisedAppliance: 'Variant details'
      }
    })
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryItems).toHaveLength(8)
    const hasOtherType = viewModel.summaryItems.some(
      (row) => row.key.text === 'Other appliance type'
    )
    const hasVariantDetails = viewModel.summaryItems.some(
      (row) => row.key.text === 'Variant details'
    )
    expect(hasOtherType).toBe(true)
    expect(hasVariantDetails).toBe(true)
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForCheckDetailsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleMarkCheckApplianceDetailsRequest', () => {
  beforeEach(() => {
    getApplianceForCheckDetailsMock.mockReset()
    markApplianceDetailsCompletedMock.mockReset()
  })

  test('marks the check as complete and redirects', async () => {
    markApplianceDetailsCompletedMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleMarkCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(markApplianceDetailsCompletedMock).toHaveBeenCalledWith('APP-1')
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('encodes appliance id in redirect', async () => {
    markApplianceDetailsCompletedMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleMarkCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP/1' } },
      h
    )

    expect(markApplianceDetailsCompletedMock).toHaveBeenCalledWith('APP/1')
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP%2F1')
  })

  test('renders error page when save fails', async () => {
    markApplianceDetailsCompletedMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleMarkCheckApplianceDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(h.redirect).not.toHaveBeenCalled()
  })
})
