import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getApplianceForModelName, saveModelName } =
  await import('./model-name-data.js')

describe('#getApplianceForModelName', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance from the technical review endpoint', async () => {
    fetchJsonMock.mockResolvedValue({ success: true })

    await getApplianceForModelName('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
  })
})

describe('#saveModelName', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the appliance model name', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelName('APP-1', 'Twin Heat M40i Pro')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      modelName: 'Twin Heat M40i Pro'
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelName('APP/1', 'Variant')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      modelName: 'Variant'
    })
  })
})
