import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceApplication } = await import('./application-data.js')

describe('#getApplianceApplication', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /applications/{applicationId}/summary?type=appliance', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'app-1' })

    const result = await getApplianceApplication('app-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/applications/app-1/summary?type=appliance'
    )
    expect(result.id).toBe('app-1')
  })
})
