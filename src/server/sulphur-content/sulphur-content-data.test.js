import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getSulphurContent,
  saveSulphurContent
} from './sulphur-content-data.js'

const { patchJsonMock, getReviewMock } = vi.hoisted(() => ({
  patchJsonMock: vi.fn(),
  getReviewMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({ patchJson: patchJsonMock }))
vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: getReviewMock
}))

describe('sulphur-content-data', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
    getReviewMock.mockReset()
  })

  test('getSulphurContent delegates to the technical review service', async () => {
    const response = { data: { id: 'f1' } }
    getReviewMock.mockResolvedValue(response)

    expect(await getSulphurContent('f1')).toBe(response)
    expect(getReviewMock).toHaveBeenCalledWith('f1')
  })

  test('saveSulphurContent patches fuelDescription.sulphurContent as a number', async () => {
    patchJsonMock.mockResolvedValue({ ok: true })

    await saveSulphurContent('f 1/2', '0.1')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/f%201%2F2', {
      fuelDescription: { sulphurContent: 0.1 }
    })
  })

  test('saveSulphurContent propagates API errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('400'))

    await expect(saveSulphurContent('f1', '1')).rejects.toThrow('400')
  })
})
