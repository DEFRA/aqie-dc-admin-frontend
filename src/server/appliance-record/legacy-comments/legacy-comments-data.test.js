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

  test('fetches from /appliances/{applianceId}/legacy-comments', async () => {
    fetchJsonMock.mockResolvedValue({ data: [] })

    const result = await getLegacyComments('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/legacy-comments'
    )
    expect(result.data).toEqual([])
  })

  test('encodes special characters in the applianceId', async () => {
    fetchJsonMock.mockResolvedValue({ data: [] })

    await getLegacyComments('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/legacy-comments'
    )
  })
})
