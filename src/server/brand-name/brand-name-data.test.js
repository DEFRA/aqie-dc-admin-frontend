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

const { getFuelForBrandName, saveBrandName } =
  await import('./brand-name-data.js')

describe('#getFuelForBrandName', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared fuel technical review fetch helper', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForBrandName('FUEL-1')

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

    const result = await getFuelForBrandName('FUEL-1')

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

    await saveBrandName('FUEL-1', 'Premium Plus')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      brandName: 'Premium Plus'
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
})
