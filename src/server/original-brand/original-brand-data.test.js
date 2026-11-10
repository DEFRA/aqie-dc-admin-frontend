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

const { getFuelForOriginalBrand, saveOriginalBrand } =
  await import('./original-brand-data.js')

describe('#getFuelForOriginalBrand', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the fuel from the technical review endpoint', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForOriginalBrand('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })
})

describe('#saveOriginalBrand', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the original fuel name via the nested originalFuel payload', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveOriginalBrand('FUEL-1', 'WHITE QUEBRACHO CHARCOAL (SP51)')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        name: 'WHITE QUEBRACHO CHARCOAL (SP51)'
      }
    })
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveOriginalBrand('FUEL/1', 'Updated original fuel name')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      originalFuel: {
        name: 'Updated original fuel name'
      }
    })
  })
})
