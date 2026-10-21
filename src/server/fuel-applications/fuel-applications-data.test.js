import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getFuelApplications,
  startFuelApplicationReview
} from './fuel-applications-data.js'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

describe('getFuelApplications', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('returns the backend summary contract without frontend re-shaping', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        new: [{ id: 'Fuel-001', items: [{ name: 'Real fuel' }] }],
        inProgress: [
          {
            id: 'Fuel-002',
            items: [{ name: 'Active fuel' }],
            reviewedBy: { name: 'Review Bob' }
          }
        ]
      }
    })

    const result = await getFuelApplications()

    expect(result.data.new).toHaveLength(1)
    expect(result.data.new[0].items).toHaveLength(1)
    expect(result.data.new[0].id).toBe('Fuel-001')
    expect(result.data.inProgress).toHaveLength(1)
    expect(result.data.inProgress[0].items).toHaveLength(1)
    expect(result.data.inProgress[0].reviewedBy.name).toBe('Review Bob')
  })
})

describe('startFuelApplicationReview', () => {
  beforeEach(() => {
    patchJsonMock.mockReset()
  })

  test('calls the in-progress patch endpoint with the reviewer payload', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    const result = await startFuelApplicationReview('fuel-123', {
      name: 'Review Bob',
      email: 'bob@example.com'
    })

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/applications/fuel-123/in-progress',
      {
        reviewedBy: {
          name: 'Review Bob',
          email: 'bob@example.com'
        }
      }
    )
    expect(result).toEqual({ success: true })
  })
})
