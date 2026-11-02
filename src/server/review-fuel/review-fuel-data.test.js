import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getFuelReview } from './review-fuel-data.js'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

describe('getFuelReview', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('returns the backend fuel payload without reshaping it', async () => {
    const fuel = {
      fuelId: 'FUEL-001',
      brandNames: 'Kings Starterlog',
      supplierType: 'Manufacturer'
    }

    fetchJsonMock.mockResolvedValue({
      success: true,
      data: fuel
    })

    const result = await getFuelReview('FUEL-001')

    expect(fetchJsonMock).toHaveBeenCalledWith('/fuels/FUEL-001')
    expect(result).toEqual({
      success: true,
      data: fuel
    })
    expect(result.data.supplierType).toBe('Manufacturer')
  })
})
