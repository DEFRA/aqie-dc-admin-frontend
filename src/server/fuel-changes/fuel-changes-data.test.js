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

const { getFuelForFuelChanges, saveFuelChanges } =
  await import('./fuel-changes-data.js')

describe('#getFuelForFuelChanges', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the fuel from the technical review endpoint', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForFuelChanges('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })
})

describe('#saveFuelChanges', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the original fuel change details when the value is true', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelChanges('FUEL-1', true, '  Mixed with another fuel  ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        isChangedOrMixed: true,
        changes: 'Mixed with another fuel'
      }
    })
  })

  test('clears the change details when the value is false', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelChanges('FUEL-1', false, 'ignored')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        isChangedOrMixed: false,
        changes: null
      }
    })
  })

  test('clears the change details when the value is whitespace', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelChanges('FUEL-1', true, '   ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        isChangedOrMixed: true,
        changes: null
      }
    })
  })

  test('clears the change details when the value is null', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelChanges('FUEL-1', true, null)

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        isChangedOrMixed: true,
        changes: null
      }
    })
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelChanges('FUEL/1', true, 'Changed fuel')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      originalFuel: {
        isChangedOrMixed: true,
        changes: 'Changed fuel'
      }
    })
  })
})
