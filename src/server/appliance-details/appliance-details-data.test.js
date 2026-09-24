import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getApplianceForCheckDetails, markApplianceDetailsCompleted } =
  await import('./appliance-details-data.js')

describe('#getApplianceForCheckDetails', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches from /appliances/{id}/technical-review', async () => {
    fetchJsonMock.mockResolvedValue({ success: true })

    await getApplianceForCheckDetails('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
  })
})

describe('#markApplianceDetailsCompleted', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('marks appliance details check as complete', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await markApplianceDetailsCompleted('APP-1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      {
        check: 'applianceDetails',
        result: true
      }
    )
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await markApplianceDetailsCompleted('APP/1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review/checks',
      {
        check: 'applianceDetails',
        result: true
      }
    )
  })
})
