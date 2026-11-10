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

const { getFuelForAdditionalRebrandNames, saveAdditionalRebrandNames } =
  await import('./additional-rebrand-names-data.js')

describe('#getFuelForAdditionalRebrandNames', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the fuel from the technical review endpoint', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForAdditionalRebrandNames('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })
})

describe('#saveAdditionalRebrandNames', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the fuel with additional rebrand names when a value is provided', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalRebrandNames('FUEL-1', '  Rebrand 1, Rebrand 2  ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
  })

  test('clears the additional rebrand names field when the value is empty', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalRebrandNames('FUEL-1', '   ')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: null
    })
  })

  test('clears the additional rebrand names field when the value is null', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalRebrandNames('FUEL-1', null)

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      additionalBrandNames: null
    })
  })

  test('encodes the fuel id in the patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalRebrandNames('FUEL/1', 'Rebrand 1')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      additionalBrandNames: 'Rebrand 1'
    })
  })
})
