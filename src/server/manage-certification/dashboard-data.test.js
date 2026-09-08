import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getCounts } = await import('./dashboard-data.js')

describe('#getCounts', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /applications/counts', async () => {
    fetchJsonMock.mockResolvedValue({
      appliance: { new: 5, inProgress: 7, records: 3359 },
      fuel: { new: 2, inProgress: 1, records: 265 }
    })

    const result = await getCounts()

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/counts')
    expect(result.appliance.new).toBe(5)
    expect(result.fuel.records).toBe(265)
  })
})
