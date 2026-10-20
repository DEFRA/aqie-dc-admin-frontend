import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceForInstructionManual } =
  await import('./appliance-record-instruction-manual-data.js')

describe('#getApplianceForInstructionManual', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /appliances/{applianceId}', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP-1' })

    const result = await getApplianceForInstructionManual('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP-1')
    expect(result.id).toBe('APP-1')
  })

  test('encodes special characters in the applianceId', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP/1' })

    await getApplianceForInstructionManual('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1')
  })
})
