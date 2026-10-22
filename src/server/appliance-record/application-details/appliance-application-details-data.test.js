import { vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplicationDetails } =
  await import('./appliance-application-details-data.js')

describe('#getApplicationDetails', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /applications/{applicationId}', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'app-1' })

    const result = await getApplicationDetails('app-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/app-1')
    expect(result.id).toBe('app-1')
  })

  test('encodes special characters in the applicationId', async () => {
    fetchJsonMock.mockResolvedValue({ id: 'app/1' })

    await getApplicationDetails('app/1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/applications/app%2F1')
  })
})
