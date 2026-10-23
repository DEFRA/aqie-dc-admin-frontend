import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getFuelApplicationDetails } from './review-fuel-application-data.js'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

describe('getFuelApplicationDetails', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('returns the backend response envelope so the controller can drill into data', async () => {
    const application = {
      id: 'app-0317',
      companyName: 'Flamers Ltd',
      companyContact: { name: 'Contact Name' },
      linkedItems: [{ brandNames: 'Kings Starterlog' }]
    }

    fetchJsonMock.mockResolvedValue({
      success: true,
      message: 'Application retrieved successfully',
      data: application
    })

    const result = await getFuelApplicationDetails('app-0317')

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/app-0317')
    expect(result).toEqual({
      success: true,
      message: 'Application retrieved successfully',
      data: application
    })
    expect(result.data.companyContact).toEqual({ name: 'Contact Name' })
    expect(result.data.linkedItems).toEqual([
      { brandNames: 'Kings Starterlog' }
    ])
  })

  test('returns the raw backend response when it is malformed', async () => {
    fetchJsonMock.mockResolvedValue(null)

    const result = await getFuelApplicationDetails('app-0317')

    expect(result).toBeNull()
  })
})
