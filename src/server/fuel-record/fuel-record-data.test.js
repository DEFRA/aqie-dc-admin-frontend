import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getFuelRecord } = await import('./fuel-record-data.js')

describe('#getFuelRecord', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('fetches the fuel record from the admin endpoint', async () => {
    const response = { success: true, data: { id: 'FUEL-1' } }
    fetchJsonMock.mockResolvedValue(response)

    const result = await getFuelRecord('FUEL-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/admin/fuels/FUEL-1')
    expect(result).toBe(response)
  })

  test('propagates backend errors', async () => {
    fetchJsonMock.mockRejectedValue(new Error('down'))

    await expect(getFuelRecord('FUEL-1')).rejects.toThrow('down')
  })
})
