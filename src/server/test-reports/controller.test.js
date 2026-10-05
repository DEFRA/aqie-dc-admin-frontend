import { beforeEach, describe, expect, test, vi } from 'vitest'
import { postTestReports } from './controller.js'

const {
  getTestReportMock,
  updateTestReportMock,
  validatePassedTestReportMock,
  validateFailedTestReportMock,
  loggerMock
} = vi.hoisted(() => ({
  getTestReportMock: vi.fn(),
  updateTestReportMock: vi.fn(),
  validatePassedTestReportMock: vi.fn(),
  validateFailedTestReportMock: vi.fn(),
  loggerMock: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => loggerMock
}))

vi.mock('./test-reports-data.js', () => ({
  getTestReport: getTestReportMock,
  updateTestReport: updateTestReportMock
}))

vi.mock('./validation.js', async () => {
  const actual = await vi.importActual('./validation.js')

  return {
    ...actual,
    validatePassedTestReport: validatePassedTestReportMock,
    validateFailedTestReport: validateFailedTestReportMock
  }
})

describe('postTestReports', () => {
  let request
  let h

  beforeEach(() => {
    getTestReportMock.mockReset()
    updateTestReportMock.mockReset()
    validatePassedTestReportMock.mockReset()
    validateFailedTestReportMock.mockReset()
    loggerMock.error.mockReset()
    loggerMock.warn.mockReset()

    updateTestReportMock.mockResolvedValue({
      success: true
    })

    request = {
      params: {
        applianceId: 'APP-123'
      },
      payload: {}
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

    validateFailedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '',
        testedOutputRated: '',
        testedOutputLow: '',
        smokeEmissionOutputRated: '',
        smokeEmissionOutputLow: ''
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(validateFailedTestReportMock).toHaveBeenCalledWith(request.payload)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', false, {
      ratedOutput: null,
      testedOutput: {
        rated: null,
        low: null
      },
      smokeEmissionOutput: {
        rated: null,
        low: null
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('retains numeric values as numbers when marking as failed', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '0',
      testedOutputRated: '0.0',
      testedOutputLow: '2.456',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '3.1'
    }

    validateFailedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '0',
        testedOutputRated: '0.0',
        testedOutputLow: '2.456',
        smokeEmissionOutputRated: '',
        smokeEmissionOutputLow: '3.1'
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(validateFailedTestReportMock).toHaveBeenCalledWith(request.payload)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', false, {
      ratedOutput: 0,
      testedOutput: {
        rated: 0.0,
        low: 2.46
      },
      smokeEmissionOutput: {
        rated: null,
        low: 3.1
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('shows validation errors when non-empty failed values are invalid', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: 'abc',
      testedOutputRated: '-1',
      testedOutputLow: 'ABC123',
      smokeEmissionOutputRated: '1abc',
      smokeEmissionOutputLow: '.'
    }

    getTestReportMock.mockResolvedValue({
      data: {
        modelName: 'Model X'
      }
    })

    validateFailedTestReportMock.mockReturnValue({
      isValid: false,
      values: {
        ratedOutput: 'abc',
        testedOutputRated: '-1',
        testedOutputLow: 'ABC123',
        smokeEmissionOutputRated: '1abc',
        smokeEmissionOutputLow: '.'
      },
      errors: {
        ratedOutput: 'The rated output must be a number',
        testedOutputRated: 'The tested output - rated must be a number',
        testedOutputLow: 'The tested output - low must be a number',
        smokeEmissionOutputRated:
          'The smoke emission output - rated must be a number',
        smokeEmissionOutputLow:
          'The smoke emission output - low must be a number'
      },
      errorList: [
        { text: 'The rated output must be a number', href: '#ratedOutput' },
        {
          text: 'The tested output - rated must be a number',
          href: '#testedOutputRated'
        },
        {
          text: 'The tested output - low must be a number',
          href: '#testedOutputLow'
        },
        {
          text: 'The smoke emission output - rated must be a number',
          href: '#smokeEmissionOutputRated'
        },
        {
          text: 'The smoke emission output - low must be a number',
          href: '#smokeEmissionOutputLow'
        }
      ]
    })

    await postTestReports(request, h)

    expect(validateFailedTestReportMock).toHaveBeenCalledWith(request.payload)
    expect(updateTestReportMock).not.toHaveBeenCalled()
    expect(h.redirect).not.toHaveBeenCalled()

    const callArgs = h.view.mock.calls[0]
    expect(callArgs[0]).toBe('test-reports/index')
    expect(callArgs[1].errorList).toHaveLength(5)
  })

  test('allows empty fields when marking as failed, even with partial invalid values', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '5.2',
      testedOutputRated: '',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    }

    validateFailedTestReportMock.mockReturnValue({
      isValid: true,
      values: {
        ratedOutput: '5.2',
        testedOutputRated: '',
        testedOutputLow: '2.4',
        smokeEmissionOutputRated: '',
        smokeEmissionOutputLow: ''
      },
      errors: {},
      errorList: []
    })

    await postTestReports(request, h)

    expect(validateFailedTestReportMock).toHaveBeenCalledWith(request.payload)

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', false, {
      ratedOutput: 5.2,
      testedOutput: {
        rated: null,
        low: 2.4
      },
      smokeEmissionOutput: {
        rated: null,
        low: null
      }
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-123')
  })

  test('rejects negative and invalid values when marking as failed', async () => {
    request.payload = {
      action: 'failed',
      ratedOutput: '-1',
      testedOutputRated: '',
      testedOutputLow: 'ABC',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    }

    getTestReportMock.mockResolvedValue({
      data: {
        modelName: 'Model X'
      }
    })

    validateFailedTestReportMock.mockReturnValue({
      isValid: false,
      values: {
        ratedOutput: '-1',
        testedOutputRated: '',
        testedOutputLow: 'ABC',
        smokeEmissionOutputRated: '',
        smokeEmissionOutputLow: ''
      },
      errors: {
        ratedOutput: 'The rated output must be a number',
        testedOutputLow: 'The tested output - low must be a number'
      },
      errorList: [
        { text: 'The rated output must be a number', href: '#ratedOutput' },
        {
          text: 'The tested output - low must be a number',
          href: '#testedOutputLow'
        }
      ]
    })

    await postTestReports(request, h)

    expect(validateFailedTestReportMock).toHaveBeenCalledWith(request.payload)
    expect(updateTestReportMock).not.toHaveBeenCalled()

    const callArgs = h.view.mock.calls[0]
    expect(callArgs[0]).toBe('test-reports/index')
    expect(callArgs[1].errorList).toHaveLength(2)
    expect(callArgs[1].errors.ratedOutput).toBe(
      'The rated output must be a number'
    )
    expect(callArgs[1].errors.testedOutputLow).toBe(
      'The tested output - low must be a number'
    )
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

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

    expect(updateTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

    await expect(postTestReports(request, h)).rejects.toThrow(
      'Select an action'
    )

    expect(updateTestReportMock).not.toHaveBeenCalled()

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()
  })

  test('returns 400 for an unknown action', async () => {
    request.payload = {
      action: 'unknown'
    }

    await expect(postTestReports(request, h)).rejects.toThrow(
      'Select an action'
    )

    expect(updateTestReportMock).not.toHaveBeenCalled()

    expect(validatePassedTestReportMock).not.toHaveBeenCalled()
  })
})
