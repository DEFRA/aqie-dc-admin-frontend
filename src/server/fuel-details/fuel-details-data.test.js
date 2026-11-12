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

const { getFuelDetails, markFuelDetailsCompleted } =
  await import('./fuel-details-data.js')

describe('#getFuelDetails', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
  })

  test('uses the shared fuel technical review fetch helper', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ data: {} })

    await getFuelDetails('fuel-uuid-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('fuel-uuid-1')
  })
})

describe('#markFuelDetailsCompleted', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
  })

  test('marks the fuelDetails check as complete without a data payload', async () => {
    patchJsonMock.mockResolvedValue({})

    await markFuelDetailsCompleted('fuel-uuid-1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/fuels/fuel-uuid-1/technical-review/checks',
      { check: 'fuelDetails', result: true }
    )
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({})

    await markFuelDetailsCompleted('fuel/1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/fuels/fuel%2F1/technical-review/checks',
      { check: 'fuelDetails', result: true }
    )
  })

  test('propagates backend errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('backend down'))

    await expect(markFuelDetailsCompleted('fuel-uuid-1')).rejects.toThrow(
      'backend down'
    )
  })
})
