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

const { getFuelForRebrandName, saveRebrandName } =
  await import('./rebrand-name-data.js')

describe('#getFuelForRebrandName', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared fuel technical review fetch helper', async () => {
    getFuelTechnicalReviewMock.mockResolvedValue({ success: true })

    await getFuelForRebrandName('FUEL-1')

    expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
  })
})

describe('#saveRebrandName', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the fuel rebranded name', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveRebrandName('FUEL-1', 'Grillaedin White Quebracho Pro')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-1', {
      brandName: 'Grillaedin White Quebracho Pro'
    })
  })

  test('encodes fuel id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveRebrandName('FUEL/1', 'Variant')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/FUEL%2F1', {
      brandName: 'Variant'
    })
  })
})
