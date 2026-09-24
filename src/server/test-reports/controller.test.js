import { beforeEach, describe, expect, test, vi } from 'vitest'

const {
  getTestReportMock,
  updateTestReportMock,
  validatePassedTestReportMock
} = vi.hoisted(() => ({
  getTestReportMock: vi.fn(),
  updateTestReportMock: vi.fn(),
  validatePassedTestReportMock: vi.fn()
}))

vi.mock('./test-reports-data.js', () => ({
  getTestReport: getTestReportMock,
  updateTestReport: updateTestReportMock
}))

vi.mock('./validation.js', async () => {
  const actual = await vi.importActual('./validation.js')

  return {
    ...actual,
    validatePassedTestReport: validatePassedTestReportMock
  }
})

import { postTestReports } from './controller.js'

describe('postTestReports', () => {
  let request
  let h

  beforeEach(() => {
    getTestReportMock.mockReset()
    updateTestReportMock.mockReset()
    validatePassedTestReportMock.mockReset()

    updateTestReportMock.mockResolvedValue({
      success: true
    })

    request = {
      params: {
        applianceId: 'APP-123'
      },
      payload: {},
      logger: {
        error: vi.fn(),
        warn: vi.fn()
      }
    }

    h = {
      redirect: vi.fn((location) => ({
        location
      })),

      response: vi.fn((body) => ({
        code: vi.fn((statusCode) => ({
          body,
          statusCode
        }))
      })),

      view: vi.fn((view, model) => ({
        code: vi.fn((statusCode) => ({
          view,
          model,
          statusCode
        }))
      }))
    }
  })

  test('retains empty fields when marking as failed', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '',
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    }

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: false,
      ratedOutput: '',
      testedOutput: {
        rated: '',
        low: ''
      },
      smokeEmissionOutput: {
        rated: '',
        low: ''
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('retains numeric values as strings when marking as failed', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '0',
      testedOutputRated: '0.0',
      testedOutputLow: '2.456',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '3.1'
    }

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: false,
      ratedOutput: '0',
      testedOutput: {
        rated: '0.0',
        low: '2.456'
      },
      smokeEmissionOutput: {
        rated: '',
        low: '3.1'
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('retains any submitted values when marking as failed', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: 'abc',
      testedOutputRated: '-1',
      testedOutputLow: 'ABC123',
      smokeEmissionOutputRated: '1abc',
      smokeEmissionOutputLow: '.'
    }

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: false,
      ratedOutput: 'abc',
      testedOutput: {
        rated: '-1',
        low: 'ABC123'
      },
      smokeEmissionOutput: {
        rated: '1abc',
        low: '.'
      }
    })

    expect(h.view).not.toHaveBeenCalled()

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('trims surrounding spaces from failed values', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '  abc  ',
      testedOutputRated: '  -1  ',
      testedOutputLow: '  ABC123  ',
      smokeEmissionOutputRated: '  1abc  ',
      smokeEmissionOutputLow: '  .  '
    }

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: false,
      ratedOutput: 'abc',
      testedOutput: {
        rated: '-1',
        low: 'ABC123'
      },
      smokeEmissionOutput: {
        rated: '1abc',
        low: '.'
      }
    })
  })

  test('validates fields when marking as passed', async () => {
    request.payload = {
      action: 'passed',
      ratedOutput: '5.2',
      testedOutputRated: '5.1',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '3.1',
      smokeEmissionOutputLow: '2.2'
    }

    validatePassedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '5.2',
        testedOutputRated: '5.1',
        testedOutputLow: '2.4',
        smokeEmissionOutputRated: '3.1',
        smokeEmissionOutputLow: '2.2'
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).toHaveBeenCalledWith(request.payload)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: true,
      ratedOutput: 5.2,
      testedOutput: {
        rated: 5.1,
        low: 2.4
      },
      smokeEmissionOutput: {
        rated: 3.1,
        low: 2.2
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('rounds passed values to two decimal places before saving', async () => {
    request.payload = {
      action: 'passed',
      ratedOutput: '5.678',
      testedOutputRated: '5.124',
      testedOutputLow: '2.555',
      smokeEmissionOutputRated: '3.999',
      smokeEmissionOutputLow: '1.005'
    }

    validatePassedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '5.678',
        testedOutputRated: '5.124',
        testedOutputLow: '2.555',
        smokeEmissionOutputRated: '3.999',
        smokeEmissionOutputLow: '1.005'
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(validatePassedTestReportMock).toHaveBeenCalledWith(request.payload)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: true,
      ratedOutput: 5.68,
      testedOutput: {
        rated: 5.12,
        low: 2.56
      },
      smokeEmissionOutput: {
        rated: 4,
        low: 1.01
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('preserves zero when marking as passed', async () => {
    request.payload = {
      action: 'passed',
      ratedOutput: '0',
      testedOutputRated: '0.0',
      testedOutputLow: '0.00',
      smokeEmissionOutputRated: '0',
      smokeEmissionOutputLow: '0.000'
    }

    validatePassedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '0',
        testedOutputRated: '0.0',
        testedOutputLow: '0.00',
        smokeEmissionOutputRated: '0',
        smokeEmissionOutputLow: '0.000'
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', {
      reviewStatus: true,
      ratedOutput: 0,
      testedOutput: {
        rated: 0,
        low: 0
      },
      smokeEmissionOutput: {
        rated: 0,
        low: 0
      }
    })
  })

  test('stays on the same page when passed values are invalid', async () => {
    request.payload = {
      action: 'passed',
      ratedOutput: '5.2',
      testedOutputRated: '5.1',
      testedOutputLow: '-4.7',
      smokeEmissionOutputRated: '3.1',
      smokeEmissionOutputLow: '2.2'
    }

    validatePassedTestReportMock.mockReturnValue({
      isValid: false,
      values: {
        ratedOutput: '5.2',
        testedOutputRated: '5.1',
        testedOutputLow: '-4.7',
        smokeEmissionOutputRated: '3.1',
        smokeEmissionOutputLow: '2.2'
      },
      errors: {
        testedOutputLow: 'The tested output - low must be a number'
      },
      errorList: [
        {
          text: 'The tested output - low must be a number',
          href: '#testedOutputLow'
        }
      ]
    })

    getTestReportMock.mockResolvedValue({
      data: {
        applianceName: 'Test appliance'
      }
    })

    const result = await postTestReports(request, h)

    expect(updateTestReportMock).not.toHaveBeenCalled()

    expect(result.statusCode).toBe(400)
    expect(result.model.hasErrors).toBe(true)

    expect(result.model.values.testedOutputLow).toBe('-4.7')

    expect(result.model.errors.testedOutputLow).toBe(
      'The tested output - low must be a number'
    )
  })

  test('returns 400 when action is missing', async () => {
    request.payload = {}

    const result = await postTestReports(request, h)

    expect(result.statusCode).toBe(400)

    expect(updateTestReportMock).not.toHaveBeenCalled()

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()
  })

  test('returns 400 for an unknown action', async () => {
    request.payload = {
      action: 'unknown'
    }

    const result = await postTestReports(request, h)

    expect(result.statusCode).toBe(400)

    expect(updateTestReportMock).not.toHaveBeenCalled()

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()
  })
})
