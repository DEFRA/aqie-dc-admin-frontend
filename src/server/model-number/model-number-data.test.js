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

const { getApplianceForModelNumber, saveModelNumber } =
  await import('./model-number-data.js')

describe('#getApplianceForModelNumber', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance from the technical review endpoint', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForModelNumber('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#saveModelNumber', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the appliance model number', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelNumber('APP-1', 'M40i-2025')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      modelNumber: 'M40i-2025'
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelNumber('APP/1', 'Variant-2025')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      modelNumber: 'Variant-2025'
    })
  })
})
