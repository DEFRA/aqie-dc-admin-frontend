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

  test('fetches the raw appliance record from the backend endpoint', async () => {
    const payload = {
      id: 'APP-001',
      modelName: 'Test Model',
      status: 'live',
      certifications: {
        england: { status: 'certified' },
        scotland: { status: 'awaiting_decision' },
        wales: { status: 'uncertified' },
        northernIreland: { status: 'not_certified' }
      }
    }

    fetchJsonMock.mockResolvedValue({ success: true, data: payload })

    const result = await getApplianceRecord('APP-001')

    expect(fetchJsonMock).toHaveBeenCalledWith('/api/admin/appliances/APP-001')
    expect(result).toEqual({ success: true, data: payload })
  })

  test('encodes the appliance id in the backend path', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: { id: 'APP/001', modelName: 'Test Model', status: 'live' }
    })

    await getApplianceRecord('APP/001')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/api/admin/appliances/APP%2F001'
    )
  })

  test('returns the backend error payload without formatting it', async () => {
    fetchJsonMock.mockResolvedValue({
      success: false,
      message: 'Appliance not found'
    })

    const result = await getApplianceRecord('APP-999')

    expect(result).toEqual({
      success: false,
      message: 'Appliance not found'
    })
  })

  test('uses the default backend error message when not provided', async () => {
    fetchJsonMock.mockResolvedValue({ success: false })

    const result = await getApplianceRecord('APP-999')

    expect(result).toEqual({
      success: false,
      message: 'Failed to load appliance record'
    })
  })

  test('throws the original backend error when the fetch fails', async () => {
    const error = new Error('Network error')
    fetchJsonMock.mockRejectedValue(error)

    await expect(getApplianceRecord('APP-001')).rejects.toThrow('Network error')
  })
})
