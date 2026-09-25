import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getApplianceForNominalOutput, saveNominalOutput } =
  await import('./nominal-output-data.js')

describe('#getApplianceForNominalOutput', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches from /appliances/{id}/technical-review', async () => {
    fetchJsonMock.mockResolvedValue({ success: true })

    await getApplianceForNominalOutput('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
  })

  test('encodes appliance id in fetch request', async () => {
    fetchJsonMock.mockResolvedValue({ success: true })

    await getApplianceForNominalOutput('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review'
    )
  })
})

describe('#saveNominalOutput', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('patches /appliances/{id} with nominalOutput as a number', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveNominalOutput('APP-1', 6.3)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      nominalOutput: 6.3
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveNominalOutput('APP/1', 5)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      nominalOutput: 5
    })
  })
})
