import { vi } from 'vitest'

const { getApplianceTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getApplianceTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

vi.mock('../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

const { getAppliance, saveTestReport } = await import('./test-reports-data.js')

describe('#testReportsData', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance technical review', async () => {
    const expected = {
      data: {
        id: 'APP-123'
      }
    }

    getApplianceTechnicalReviewMock.mockResolvedValue(expected)

    const result = await getAppliance('APP-123')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-123')
    expect(result).toEqual(expected)
  })

  test('returns the appliance data from the shared service', async () => {
    const expected = {
      data: {
        id: 'APP-456',
        testReports: {
          result: true
        }
      }
    }

    getApplianceTechnicalReviewMock.mockResolvedValue(expected)

    const result = await getAppliance('APP-456')

    expect(result).toEqual(expected)
  })

  test('saves a passed test-report check', async () => {
    const testReport = {
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

    patchJsonMock.mockResolvedValue({
      success: true
    })

    const result = await saveTestReport('APP-123', true, testReport)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-123/technical-review/checks',
      {
        check: 'testReports',
        result: true,
        testReport
      }
    )

    expect(result).toEqual({
      success: true
    })
  })

  test('saves a failed test-report check', async () => {
    const testReport = {
      ratedOutput: 10,
      testedOutput: {
        rated: 8,
        low: 3
      },
      smokeEmissionOutput: {
        rated: 2,
        low: 1
      }
    }

    patchJsonMock.mockResolvedValue({
      success: true
    })

    await saveTestReport('APP-123', false, testReport)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-123/technical-review/checks',
      {
        check: 'testReports',
        result: false,
        testReport
      }
    )
  })

  test('keeps the supplied test-report payload unchanged', async () => {
    const testReport = {
      ratedOutput: 12.5,
      testedOutput: {
        rated: 11,
        low: 5
      },
      smokeEmissionOutput: {
        rated: 3,
        low: 1.5
      }
    }

    patchJsonMock.mockResolvedValue({
      success: true
    })

    await saveTestReport('APP-123', true, testReport)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-123/technical-review/checks',
      {
        check: 'testReports',
        result: true,
        testReport
      }
    )
  })

  test('encodes the appliance id when saving', async () => {
    const testReport = {
      ratedOutput: 10
    }

    patchJsonMock.mockResolvedValue({
      success: true
    })

    await saveTestReport('APP/123', true, testReport)

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F123/technical-review/checks',
      {
        check: 'testReports',
        result: true,
        testReport
      }
    )
  })

  test('propagates errors when fetching the appliance fails', async () => {
    getApplianceTechnicalReviewMock.mockRejectedValue(new Error('GET failed'))

    await expect(getAppliance('APP-123')).rejects.toThrow('GET failed')
  })

  test('propagates errors when saving the test report fails', async () => {
    const testReport = {
      ratedOutput: 10
    }

    patchJsonMock.mockRejectedValue(new Error('PATCH failed'))

    await expect(saveTestReport('APP-123', true, testReport)).rejects.toThrow(
      'PATCH failed'
    )
  })
})
