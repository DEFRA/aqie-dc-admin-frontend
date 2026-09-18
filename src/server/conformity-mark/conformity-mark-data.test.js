import { vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getAppliance, saveConformityMarkResult } =
  await import('./conformity-mark-data.js')

describe('#conformityMarkData', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance technical review', async () => {
    fetchJsonMock.mockResolvedValue({ data: { id: 'APP-1' } })

    const result = await getAppliance('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
    expect(result.data.id).toBe('APP-1')
  })

  test('encodes the appliance id when fetching', async () => {
    fetchJsonMock.mockResolvedValue({})

    await getAppliance('APP/1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review'
    )
  })

  test('saves a passed result against the conformityMark check', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveConformityMarkResult('APP-1', true)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      { check: 'conformityMark', result: true }
    )
  })

  test('saves a failed result', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveConformityMarkResult('APP-1', false)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      { check: 'conformityMark', result: false }
    )
  })

  test('encodes the appliance id when saving', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveConformityMarkResult('APP/1', true)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review/checks',
      { check: 'conformityMark', result: true }
    )
  })
})
