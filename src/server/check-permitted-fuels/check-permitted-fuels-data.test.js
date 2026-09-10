import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getApplianceForPermittedFuels, savePermittedFuels } =
  await import('./check-permitted-fuels-data.js')

describe('#getApplianceForPermittedFuels', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches from /appliances/{id}/technical-review', async () => {
    fetchJsonMock.mockResolvedValue({ success: true })

    await getApplianceForPermittedFuels('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
  })
})

describe('#savePermittedFuels', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('saves permitted fuels values then marks listing check completed', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await savePermittedFuels('APP-1', 'Wood logs', true)

    expect(patchJsonMock).toHaveBeenNthCalledWith(1, '/appliances/APP-1', {
      permittedFuels: 'Wood logs',
      isPermittedToBurnWood: true
    })
    expect(patchJsonMock).toHaveBeenNthCalledWith(
      2,
      '/appliances/APP-1/technical-review/checks',
      { check: 'permittedFuels', result: true }
    )
  })

  test('encodes appliance id in both requests', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await savePermittedFuels('APP/1', 'Wood logs', false)

    expect(patchJsonMock).toHaveBeenNthCalledWith(1, '/appliances/APP%2F1', {
      permittedFuels: 'Wood logs',
      isPermittedToBurnWood: false
    })
    expect(patchJsonMock).toHaveBeenNthCalledWith(
      2,
      '/appliances/APP%2F1/technical-review/checks',
      { check: 'permittedFuels', result: true }
    )
  })
})
