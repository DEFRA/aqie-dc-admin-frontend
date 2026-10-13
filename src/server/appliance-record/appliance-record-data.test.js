import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceRecord } = await import('./appliance-record-data.js')

describe('#getApplianceRecord', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('fetches the backend appliance record response from the admin endpoint', async () => {
    const response = {
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        status: 'live'
      }
    }

    fetchJsonMock.mockResolvedValue(response)

    const result = await getApplianceRecord('APP-001')

    expect(fetchJsonMock).toHaveBeenCalledWith('/api/admin/appliances/APP-001')
    expect(result).toEqual(response)
  })

  test('encodes the appliance id in the request path', async () => {
    fetchJsonMock.mockResolvedValue({ success: true, data: { id: 'APP/001' } })

    await getApplianceRecord('APP/001')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/api/admin/appliances/APP%2F001'
    )
  })

  test('returns the backend response unchanged for error responses', async () => {
    const response = {
      success: false,
      message: 'Backend unavailable'
    }

    fetchJsonMock.mockResolvedValue(response)

    const result = await getApplianceRecord('APP-001')

    expect(result).toEqual(response)
  })
})
