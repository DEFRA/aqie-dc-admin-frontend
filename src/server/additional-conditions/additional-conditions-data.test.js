import { vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getAppliance, saveAdditionalConditions } =
  await import('./additional-conditions-data.js')

describe('#additionalConditionsData', () => {
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

  test('saves the entered additional conditions text as a completed check', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalConditions(
      'APP-1',
      'Standard additional condition text'
    )

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      {
        check: 'additionalConditions',
        result: true,
        data: {
          additionalConditions: 'Standard additional condition text'
        }
      }
    )
  })

  test('keeps the payload consistent for a second save of the same condition text', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalConditions('APP-1', 'Optional notes')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      {
        check: 'additionalConditions',
        result: true,
        data: {
          additionalConditions: 'Optional notes'
        }
      }
    )
  })

  test('encodes the appliance id when saving', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveAdditionalConditions(
      'APP/1',
      'Standard additional condition text'
    )

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review/checks',
      {
        check: 'additionalConditions',
        result: true,
        data: {
          additionalConditions: 'Standard additional condition text'
        }
      }
    )
  })
})
