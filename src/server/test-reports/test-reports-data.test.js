import { beforeEach, describe, expect, it, vi } from 'vitest'
import { patchJson } from '../common/api/api.js'
import { getTestReport, updateTestReport } from './test-reports-data.js'

vi.mock('../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: vi.fn()
}))

const { getApplianceTechnicalReview } =
  await import('../common/services/common-appliance-service.js')

describe('review-test-reports-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets a test report via the technical-review endpoint', async () => {
    const expected = {
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Model X',
        testResults: {
          reviewStatus: null,
          ratedOutput: 10
        },
        technicalReview: {
          documentationChecks: {
            testReports: null
          }
        }
      }
    }

    getApplianceTechnicalReview.mockResolvedValue(expected)

    const result = await getTestReport('APP-123')

    expect(getApplianceTechnicalReview).toHaveBeenCalledWith('APP-123')

    expect(result).toEqual(expected)
  })

  it('updates a test report via the technical-review/checks endpoint', async () => {
    const testResults = {
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

    const response = {
      success: true,
      data: {
        id: 'APP-123',
        testResults,
        technicalReview: {
          documentationChecks: {
            testReports: true
          }
        }
      }
    }

    patchJson.mockResolvedValue(response)

    const result = await updateTestReport('APP-123', true, testResults)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/APP-123/technical-review/checks',
      {
        check: 'testReports',
        result: true,
        data: {
          testResults
        }
      }
    )

    expect(result).toEqual(response)
  })

  it('URL-encodes the appliance identifier when updating a report', async () => {
    const testResults = {
      ratedOutput: 10
    }

    patchJson.mockResolvedValue({})

    await updateTestReport('APP/123', false, testResults)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/APP%2F123/technical-review/checks',
      {
        check: 'testReports',
        result: false,
        data: {
          testResults
        }
      }
    )
  })

  it('propagates errors when getting a report fails', async () => {
    const error = new Error('GET failed')
    getApplianceTechnicalReview.mockRejectedValue(error)

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
