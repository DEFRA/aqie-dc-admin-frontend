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

const { getFuelForAdditionalBrandNames, saveAdditionalBrandNames } =
  await import('./additional-brand-names-data.js')

describe('#getFuelForAdditionalBrandNames', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the fuel from the technical review endpoint', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForAdditionalBrandNames('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })
})

describe('#saveAdditionalBrandNames', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the fuel with additional brand names when a value is provided', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalBrandNames('FUEL-1', '  Brand 1, Brand 2  ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: 'Brand 1, Brand 2'
    })
  })

  test('clears the additional brand names field when the value is empty', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalBrandNames('FUEL-1', '   ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: null
    })
  })

  test('clears the additional brand names field when the value is null', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalBrandNames('FUEL-1', null)

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: null
    })
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalBrandNames('FUEL/1', 'Brand 1')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      additionalBrandNames: 'Brand 1'
    })
  })
})
