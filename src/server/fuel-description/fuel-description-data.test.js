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

const { getFuelDescription, markFuelDescriptionComplete } =
  await import('./fuel-description-data.js')

describe('#getFuelDescription', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared fuel technical review fetch helper', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ data: {} })

    await getFuelDescription('fuel-uuid-2')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('fuel-uuid-2')
  })
})

describe('#markFuelDescriptionComplete', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('marks the fuelDescription check as complete without a data payload', async () => {
    patchJsonMock.mockResolvedValue({})

    await markFuelDescriptionComplete('fuel-uuid-2')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/fuels/fuel-uuid-2/technical-review/checks',
      { check: 'fuelDescription', result: true }
    )
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({})

    await markFuelDescriptionComplete('fuel/2')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/fuels/fuel%2F2/technical-review/checks',
      { check: 'fuelDescription', result: true }
    )
  })

  test('propagates backend errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('backend down'))

    await expect(markFuelDescriptionComplete('fuel-uuid-2')).rejects.toThrow(
      'backend down'
    )
  })
})
