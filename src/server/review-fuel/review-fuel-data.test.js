import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getFuelReview, saveFuelReview } from './review-fuel-data.js'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

describe('fuel review data contract', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the fuel review data from the technical-review endpoint', async () => {
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

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/fuels/FUEL-001/technical-review'
    )
    expect(result).toEqual({
      success: true,
      data: fuel
    })
    expect(result.data.supplierType).toBe('Manufacturer')
  })

  test('encodes the fuel id when fetching the technical review', async () => {
    fetchJsonMock.mockResolvedValue({})

    await getFuelReview('FUEL/001 2')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/fuels/FUEL%2F001%202/technical-review'
    )
  })

  test('patches the decision with the reviewer at the technical-review endpoint', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveFuelReview('FUEL-001', 'accepted', {
      name: 'A Reviewer',
      email: 'a@defra.gov.uk'
    })

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/fuels/FUEL-001/technical-review',
      {
        status: 'accepted',
        reviewedBy: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
      }
    )
  })
})
