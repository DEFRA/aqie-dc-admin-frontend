import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getManufacturingProcess,
  saveManufacturingProcess
} from './manufacturing-process-data.js'

const { patchJsonMock, getReviewMock } = vi.hoisted(() => ({
  patchJsonMock: vi.fn(),
  getReviewMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({ patchJson: patchJsonMock }))
vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: getReviewMock
}))

describe('manufacturing-process-data', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
    getReviewMock.mockReset()
  })

  test('getManufacturingProcess delegates to the technical review service', async () => {
    const response = { data: { id: 'f1' } }
    getReviewMock.mockResolvedValue(response)

    expect(await getManufacturingProcess('f1')).toBe(response)
    expect(getReviewMock).toHaveBeenCalledWith('f1')
  })

  test('saveManufacturingProcess patches the top-level manufacturingProcess', async () => {
    patchJsonMock.mockResolvedValue({ ok: true })

    await saveManufacturingProcess('f 1/2', 'Pressed and dried')

    expect(patchJsonMock).toHaveBeenCalledWith('/fuels/f%201%2F2', {
      manufacturingProcess: 'Pressed and dried'
    })
  })

  test('saveManufacturingProcess propagates API errors', async () => {
    patchJsonMock.mockRejectedValue(new Error('400'))

    await expect(saveManufacturingProcess('f1', 'x')).rejects.toThrow('400')
  })
})
