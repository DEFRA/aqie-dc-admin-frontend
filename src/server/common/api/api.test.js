import { vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn()
}))

vi.mock('node-fetch', () => ({
  default: fetchMock
}))

const { fetchJson, patchJson } = await import('./api.js')

describe('#api transport', () => {
  beforeEach(() => fetchMock.mockReset())

  test('fetchJson sends GET with default headers and parses JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: 'world' })
    })

    const result = await fetchJson('/applications/counts')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/applications\/counts$/),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'x-api-key': expect.any(String) })
      })
    )
    expect(result).toEqual({ hello: 'world' })
  })

  test('patchJson sends PATCH with JSON body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({})
    })

    await patchJson('/applications/1083/reviewer', { foo: 'bar' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe('{"foo":"bar"}')
  })

  test('throws on non-ok response with logged context', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'oops'
    })

    await expect(fetchJson('/x')).rejects.toThrow(/500/)
  })

  test('returns null for 204 No Content', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 })

    expect(await patchJson('/x', {})).toBeNull()
  })
})
