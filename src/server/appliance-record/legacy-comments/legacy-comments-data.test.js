import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getLegacyComments } = await import('./legacy-comments-data.js')

describe('#getLegacyComments', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /appliances/{applianceId}', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP-1' })

    const result = await getLegacyComments('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP-1')
    expect(result.id).toBe('APP-1')
  })

  test('encodes special characters in the applianceId', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'APP/1' })

    await getLegacyComments('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1')
  })
})
