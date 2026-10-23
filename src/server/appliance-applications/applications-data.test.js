import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }))

vi.mock('../common/api/api.js', () => ({ fetchJson: fetchJsonMock }))

const { getApplianceApplications } = await import('./applications-data.js')

describe('#getApplianceApplications', () => {
  test('Should fetch the appliance applications summary from the backend contract', async () => {
    const payload = {
      data: {
        new: [{ id: 'APP-1' }],
        inProgress: [{ id: 'APP-2' }]
      }
    }
    fetchJsonMock.mockResolvedValue(payload)

    const result = await getApplianceApplications()

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/applications/summary-by-status?type=appliance'
    )
    expect(result).toBe(payload)
    expect(result.data.new).toEqual([{ id: 'APP-1' }])
    expect(result.data.inProgress).toEqual([{ id: 'APP-2' }])
  })
})
