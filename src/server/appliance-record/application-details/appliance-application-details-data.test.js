import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceDetail, getApplicationDetails } =
  await import('./appliance-application-details-data.js')

// Rejects only when awaited, so the spy never holds an unhandled rejected promise.
const rejectsWith = (error) => ({
  then: (_resolve, reject) => reject(error)
})

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

  test('propagates errors from fetchJson', async () => {
    fetchJsonMock.mockImplementation(() => rejectsWith(new Error('not found')))

    await expect(getApplicationDetails('app-1')).rejects.toThrow('not found')
  })
})

describe('#getApplianceDetail', () => {
  beforeEach(() => fetchJsonMock.mockReset())

  test('fetches from /appliances/{applianceId}', async () => {
    fetchJsonMock.mockResolvedValue({ data: { id: 'APP-1' } })

    const result = await getApplianceDetail('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP-1')
    expect(result.data.id).toBe('APP-1')
  })

  test('encodes special characters in the applianceId', async () => {
    fetchJsonMock.mockResolvedValue({ data: { id: 'APP/1' } })

    await getApplianceDetail('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1')
  })

  test('propagates errors from fetchJson', async () => {
    fetchJsonMock.mockImplementation(() =>
      rejectsWith(new Error('backend down'))
    )

    await expect(getApplianceDetail('APP-1')).rejects.toThrow('backend down')
  })
})
