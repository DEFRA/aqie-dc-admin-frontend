import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getFuelComposition,
  saveFuelComposition
} from './fuel-composition-data.js'

const { patchJsonMock, getReviewMock } = vi.hoisted(() => ({
  patchJsonMock: vi.fn(),
  getReviewMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({ patchJson: patchJsonMock }))
vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: getReviewMock
}))

describe('fuel-composition-data', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
    getReviewMock.mockReset()
  })

  test('getFuelComposition delegates to the technical review service', async () => {
    const response = { data: { id: 'f1' } }
    getReviewMock.mockResolvedValue(response)

    expect(await getFuelComposition('f1')).toBe(response)
    expect(getReviewMock).toHaveBeenCalledWith('f1')
  })

  test('saveFuelComposition patches only fuelDescription.composition', async () => {
    patchJsonMock.mockResolvedValue({ ok: true })

    await saveFuelComposition('f 1/2', 'Slack wax')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/f%201%2F2', {
      fuelDescription: { composition: 'Slack wax' }
    })
  })

  test('saveFuelComposition propagates API errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('400'))

    await expect(saveFuelComposition('f1', 'x')).rejects.toThrow('400')
  })
})
