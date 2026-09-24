import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getApplianceTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getApplianceTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

vi.mock('../common/services/commonService.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

const { getApplianceForVariant, saveVariantAppliance } =
  await import('./variant-appliance-data.js')

describe('#getApplianceForVariant', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance from the technical review endpoint', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForVariant('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#saveVariantAppliance', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the appliance with variant choice and details when isVariant is true', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveVariantAppliance('APP-1', true, 'Original model details')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      isVariant: true,
      existingAuthorisedAppliance: 'Original model details'
    })
  })

  test('updates the appliance with isVariant false and clears variant details', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveVariantAppliance('APP-1', false, null)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      isVariant: false,
      existingAuthorisedAppliance: null
    })
  })

  test('clears existing variant details when user changes from YES to NO', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    // Simulate user changing from YES (with details) to NO
    await saveVariantAppliance('APP-1', false, null)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      isVariant: false,
      existingAuthorisedAppliance: null
    })
  })

  test('updates appliance with isVariant true but no details when details are empty', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveVariantAppliance('APP-1', true, null)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      isVariant: true
    })
  })

  test('updates appliance with isVariant true but no details when details are empty string', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveVariantAppliance('APP-1', true, '')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      isVariant: true
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveVariantAppliance('APP/1', true, 'Variant details')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      isVariant: true,
      existingAuthorisedAppliance: 'Variant details'
    })
  })
})
