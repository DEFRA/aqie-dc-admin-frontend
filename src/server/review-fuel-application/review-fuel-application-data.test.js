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

  test('fetches the full application and normalises the fuel list', async () => {
    fetchJsonMock.mockResolvedValue({
      data: {
        id: 'app-0317',
        companyName: 'Flamers Ltd',
        companyContact: { name: 'Contact Name' },
        fuels: [{ brandNames: 'Kings Starterlog' }]
      }
    })

    const result = await getFuelApplicationDetails('app-0317')

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/app-0317')
    expect(result.data.companyContact).toEqual({ name: 'Contact Name' })
    expect(result.data.fuels).toEqual([{ brandNames: 'Kings Starterlog' }])
  })

  test('returns the raw backend fuel application shape when linkedItems is used', async () => {
    fetchJsonMock.mockResolvedValue({
      data: {
        id: 'app-0317',
        linkedItems: [
          {
            companyName: 'FuelCo',
            companyFullAddress: '789 Industrial Estate, Manchester, M1 3CD',
            companyContact: { name: 'Fuel Person', email: 'JD@email.com' },
            responsiblePerson: { name: 'Rep Name', email: 'rep@co.com' },
            customerComplaints: false,
            fuelBagging: 'Bagged',
            manufacturerOrReseller: 'Manufacturer',
            brandNames: 'PelletBrand',
            technicalReview: { status: 'in_progress' }
          }
        ]
      }
    })

    const result = await getFuelApplicationDetails('app-0317')

    expect(result.data.linkedItems[0].companyName).toBe('FuelCo')
    expect(result.data.linkedItems[0].companyContact).toEqual({
      name: 'Fuel Person',
      email: 'JD@email.com'
    })
    expect(result.data.linkedItems[0].brandNames).toBe('PelletBrand')
  })

  test('returns an empty object when the backend payload is malformed', async () => {
    fetchJsonMock.mockResolvedValue(null)

    const result = await getFuelApplicationDetails('app-0317')

    expect(result.data).toEqual({})
  })
})
