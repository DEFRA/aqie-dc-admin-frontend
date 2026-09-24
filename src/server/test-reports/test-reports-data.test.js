import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchJson, patchJson } from '../common/api/api.js'
import { getTestReport, updateTestReport } from './test-reports-data.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('review-test-reports-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets a test report', async () => {
    const expected = {
      reviewStatus: null
    }

    fetchJson.mockResolvedValue(expected)

    const result = await getTestReport('APP-123')

    expect(fetchJson).toHaveBeenCalledWith('/appliances/APP-123/test-reports')

    expect(result).toEqual(expected)
  })

  it('URL-encodes the appliance identifier when getting a report', async () => {
    fetchJson.mockResolvedValue({})

    await getTestReport('APP/123')

    expect(fetchJson).toHaveBeenCalledWith('/appliances/APP%2F123/test-reports')
  })

  it('updates a test report', async () => {
    const payload = {
      reviewStatus: true,
      ratedOutput: 10.5,
      testedOutput: {
        rated: 9.75,
        low: 4
      },
      smokeEmissionOutput: {
        rated: 2.25,
        low: 1.1
      }
    }

    patchJson.mockResolvedValue(payload)

    const result = await updateTestReport('APP-123', payload)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/APP-123/test-reports',
      payload
    )

    expect(result).toEqual(payload)
  })

  it('URL-encodes the appliance identifier when updating a report', async () => {
    const payload = {
      reviewStatus: false,
      ratedOutput: 10
    }

    patchJson.mockResolvedValue(payload)

    await updateTestReport('APP/123', payload)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/APP%2F123/test-reports',
      payload
    )
  })

  it('propagates errors when getting a report fails', async () => {
    const error = new Error('GET failed')
    fetchJson.mockRejectedValue(error)

    await expect(getTestReport('APP-123')).rejects.toThrow('GET failed')
  })

  it('propagates errors when updating a report fails', async () => {
    const error = new Error('PATCH failed')
    patchJson.mockRejectedValue(error)

    await expect(
      updateTestReport('APP-123', {
        reviewStatus: true,
        ratedOutput: 10
      })
    ).rejects.toThrow('PATCH failed')
  })
})
