import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceDetail } = await import('./appliance-record-detail-data.js')

describe('#getApplianceDetail', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /appliances/{applianceId}', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP-1' })

    const result = await getApplianceDetail('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP-1')
    expect(result.id).toBe('APP-1')
  })

  test('encodes special characters in the applianceId', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP/1' })

    await getApplianceDetail('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1')
  })
})
