import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchJson, patchJson } from '../common/api/api.js'
import {
  getFuelTechnicalReview,
  saveFuelTechnicalReview
} from './test-results-data.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('test-results-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the current fuel technical review data', async () => {
    const expected = {
      success: true,
      data: {
        fuelId: 'FUEL-001',
        testResults: {
          smokeEmission: 1.25,
          sulphurContent: 0.5
        }
      }
    }

    fetchJson.mockResolvedValue(expected)

    const result = await getFuelTechnicalReview('FUEL-001')

    expect(fetchJson).toHaveBeenCalledWith('/fuels/FUEL-001/technical-review')
    expect(result).toEqual(expected)
  })

  it('saves passed test results to the technical-review checks endpoint', async () => {
    const response = {
      success: true,
      data: {
        fuelId: 'FUEL-001',
        check: 'testResults',
        result: true
      }
    }

    patchJson.mockResolvedValue(response)

    const result = await saveFuelTechnicalReview('FUEL-001', true, {
      smokeEmission: 1.25,
      sulphurContent: 0.5
    })

    expect(patchJson).toHaveBeenCalledWith(
      '/fuels/FUEL-001/technical-review/checks',
      {
        check: 'testResults',
        result: true,
        data: {
          testResults: {
            smokeEmission: 1.25,
            sulphurContent: 0.5
          }
        }
      }
    )

    expect(result).toEqual(response)
  })

  it('URL-encodes the fuel identifier when saving failed results', async () => {
    patchJson.mockResolvedValue({ success: true })

    await saveFuelTechnicalReview('FUEL/001', false, {
      smokeEmission: null,
      sulphurContent: null
    })

    expect(patchJson).toHaveBeenCalledWith(
      '/fuels/FUEL%2F001/technical-review/checks',
      {
        check: 'testResults',
        result: false,
        data: {
          testResults: {
            smokeEmission: null,
            sulphurContent: null
          }
        }
      }
    )
  })
})
