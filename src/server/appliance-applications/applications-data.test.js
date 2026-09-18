import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }))

vi.mock('../common/api/api.js', () => ({ fetchJson: fetchJsonMock }))

const { getApplianceApplications } = await import('./applications-data.js')

describe('#getApplianceApplications', () => {
  test('Should fetch the appliance applications summary from the backend', async () => {
    const payload = { data: { new: [], inProgress: [] } }
    fetchJsonMock.mockResolvedValue(payload)

    const result = await getApplianceApplications()

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/summary')
    expect(result).toBe(payload)
  })
})
