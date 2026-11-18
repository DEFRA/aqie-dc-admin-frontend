import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getQualityControl,
  saveQualityControl
} from './quality-control-data.js'

const { patchJsonMock, getReviewMock } = vi.hoisted(() => ({
  patchJsonMock: vi.fn(),
  getReviewMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({ patchJson: patchJsonMock }))
vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: getReviewMock
}))

describe('quality-control-data', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
    getReviewMock.mockReset()
  })

  test('getQualityControl delegates to the technical review service', async () => {
    const response = { data: { id: 'f1' } }
    getReviewMock.mockResolvedValue(response)

    expect(await getQualityControl('f1')).toBe(response)
    expect(getReviewMock).toHaveBeenCalledWith('f1')
  })

  test('saveQualityControl patches the top-level hasQualityControlSystem boolean', async () => {
    patchJsonMock.mockResolvedValue({ ok: true })

    await saveQualityControl('f 1/2', false)

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/f%201%2F2', {
      hasQualityControlSystem: false
    })
  })

  test('saveQualityControl propagates API errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('400'))

    await expect(saveQualityControl('f1', true)).rejects.toThrow('400')
  })
})
