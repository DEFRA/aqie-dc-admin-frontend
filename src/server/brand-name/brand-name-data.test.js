import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getFuelTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getFuelTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: getFuelTechnicalReviewMock
}))

const { getFuel, saveBrandName } = await import('./brand-name-data.js')

describe('#getFuel', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared fuel technical review fetch helper', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuel('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })

  test('passes through the technical review response', async () => {
    const expectedResponse = {
      data: {
        id: 'FUEL-1',
        brandName: 'Test Fuel',
        technicalReview: { status: 'in_review' }
      }
    }
    getFuelTechnicalReviewMock.mockResolvedValue(expectedResponse)

    const result = await getFuel('FUEL-1')

    expect(result).toEqual(expectedResponse)
  })
})

describe('#saveBrandName', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the fuel brand name via direct fuel endpoint', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveBrandName('FUEL-1', 'New Brand')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      brandName: 'New Brand'
    })
  })

  test('encodes fuel id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveBrandName('FUEL/1', 'Variant')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      brandName: 'Variant'
    })
  })

  test('handles special characters in fuel id', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveBrandName('FUEL?id=1&test', 'Test Brand')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%3Fid%3D1%26test', {
      brandName: 'Test Brand'
    })
  })

  test('works for both Manufacturer and Rebrand supplier types', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    // Manufacturer supplierType
    await saveBrandName('FUEL-M1', 'Brand Name')
    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-M1', {
      brandName: 'Brand Name'
    })

    // Rebrand supplierType
    await saveBrandName('FUEL-R1', 'Rebranded Name')
    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-R1', {
      brandName: 'Rebranded Name'
    })
  })
})
