import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getApplianceMock, saveTestReportMock, validatePassedTestReportMock } =
  vi.hoisted(() => ({
    getApplianceMock: vi.fn(),
    saveTestReportMock: vi.fn(),
    validatePassedTestReportMock: vi.fn()
  }))

vi.mock('./test-reports-data.js', () => ({
  getAppliance: getApplianceMock,
  saveTestReport: saveTestReportMock
}))

vi.mock('./validation.js', async () => {
  const actual = await vi.importActual('./validation.js')

  return {
    ...actual,
    validatePassedTestReport: validatePassedTestReportMock
  }
})

const { getTestReports, postTestReports } = await import('./controller.js')

describe('#testReportsController', () => {
  let request
  let h

  beforeEach(() => {
    getApplianceMock.mockReset()
    saveTestReportMock.mockReset()
    validatePassedTestReportMock.mockReset()

    saveTestReportMock.mockResolvedValue({
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
        view,
        model,
        code: vi.fn((statusCode) => ({
          view,
          model,
          statusCode
        }))
      }))
    }
  })

  describe('getTestReports', () => {
    test('loads the appliance technical review and displays the page', async () => {
      getApplianceMock.mockResolvedValue({
        data: {
          modelName: 'Example appliance',
          testReports: {
            result: true,
            data: {
              ratedOutput: 5.2,
              testedOutput: {
                rated: 5.1,
                low: 2.4
              },
              smokeEmissionOutput: {
                rated: 3.1,
                low: 2.2
              }
            }
          }
        }
      })

      const result = await getTestReports(request, h)

      expect(getApplianceMock).toHaveBeenCalledWith('APP-123')

      expect(h.view).toHaveBeenCalledWith(
        'test-reports/index',
        expect.objectContaining({
          applianceId: 'APP-123',
          applianceName: 'Example appliance',
          previousPageUrl: '/review-appliance/APP-123',
          hasErrors: false
        })
      )

      expect(result.model.values).toEqual(
        expect.objectContaining({
          ratedOutput: '5.2',
          testedOutputRated: '5.1',
          testedOutputLow: '2.4',
          smokeEmissionOutputRated: '3.1',
          smokeEmissionOutputLow: '2.2'
        })
      )
    })

    test('uses appliance as the fallback appliance name', async () => {
      getApplianceMock.mockResolvedValue({
        data: {}
      })

      const result = await getTestReports(request, h)

      expect(result.model.applianceName).toBe('appliance')
    })

    test('logs and propagates an error when loading the appliance fails', async () => {
      const error = new Error('GET failed')

      getApplianceMock.mockRejectedValue(error)

      await expect(getTestReports(request, h)).rejects.toThrow('GET failed')

      expect(request.logger.error).toHaveBeenCalledWith(
        {
          error,
          applianceId: 'APP-123'
        },
        '[reviewTestReports] Failed to load review test reports for APP-123: GET failed'
      )
    })
  })

  describe('postTestReports', () => {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', false, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', false, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', false, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', false, {
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

    test('converts null and undefined failed values to empty strings', async () => {
      request.payload = {
        action: 'failed',
        ratedOutput: null,
        testedOutputRated: undefined,
        testedOutputLow: null,
        smokeEmissionOutputRated: undefined,
        smokeEmissionOutputLow: null
      }

      await postTestReports(request, h)

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', false, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

      expect(saveTestReportMock).toHaveBeenCalledWith('APP-123', true, {
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

      getApplianceMock.mockResolvedValue({
        data: {
          modelName: 'Test appliance'
        }
      })

      const result = await postTestReports(request, h)

      expect(getApplianceMock).toHaveBeenCalledWith('APP-123')
      expect(saveTestReportMock).not.toHaveBeenCalled()

      expect(result.statusCode).toBe(400)
      expect(result.model.applianceName).toBe('Test appliance')
      expect(result.model.hasErrors).toBe(true)
      expect(result.model.values.testedOutputLow).toBe('-4.7')

      expect(result.model.errors.testedOutputLow).toBe(
        'The tested output - low must be a number'
      )
    })

    test('renders validation errors even when reloading the appliance fails', async () => {
      const reloadError = new Error('Reload failed')

      request.payload = {
        action: 'passed'
      }

      validatePassedTestReportMock.mockReturnValue({
        isValid: false,
        values: {
          ratedOutput: ''
        },
        errors: {
          ratedOutput: 'Enter the rated output'
        },
        errorList: [
          {
            text: 'Enter the rated output',
            href: '#ratedOutput'
          }
        ]
      })

      getApplianceMock.mockRejectedValue(reloadError)

      const result = await postTestReports(request, h)

      expect(result.statusCode).toBe(400)
      expect(result.model.applianceName).toBe('appliance')
      expect(result.model.hasErrors).toBe(true)

      expect(request.logger.warn).toHaveBeenCalledWith(
        {
          error: reloadError,
          applianceId: 'APP-123'
        },
        '[reviewTestReports] Unable to reload appliance details after validation failure for APP-123: Reload failed'
      )
    })

    test('returns 400 when action is missing', async () => {
      request.payload = {}

      const result = await postTestReports(request, h)

      expect(result.statusCode).toBe(400)
      expect(result.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Select an action'
      })

      expect(saveTestReportMock).not.toHaveBeenCalled()
      expect(validatePassedTestReportMock).not.toHaveBeenCalled()
    })

    test('returns 400 for an unknown action', async () => {
      request.payload = {
        action: 'unknown'
      }

      const result = await postTestReports(request, h)

      expect(result.statusCode).toBe(400)
      expect(saveTestReportMock).not.toHaveBeenCalled()
      expect(validatePassedTestReportMock).not.toHaveBeenCalled()
    })

    test('logs and propagates an error when saving a failed report fails', async () => {
      const error = new Error('PATCH failed')

      request.payload = {
        action: 'failed',
        ratedOutput: ''
      }

      saveTestReportMock.mockRejectedValue(error)

      await expect(postTestReports(request, h)).rejects.toThrow('PATCH failed')

      expect(request.logger.error).toHaveBeenCalledWith(
        {
          error,
          applianceId: 'APP-123',
          action: 'failed'
        },
        '[reviewTestReports] Failed to mark review test reports for APP-123: PATCH failed'
      )
    })

    test('logs and propagates an error when saving a passed report fails', async () => {
      const error = new Error('PATCH failed')

      request.payload = {
        action: 'passed'
      }

      validatePassedTestReportMock.mockReturnValue({
        isValid: true,
        values: {
          ratedOutput: '5',
          testedOutputRated: '4',
          testedOutputLow: '3',
          smokeEmissionOutputRated: '2',
          smokeEmissionOutputLow: '1'
        },
        errors: {},
        errorList: []
      })

      saveTestReportMock.mockRejectedValue(error)

      await expect(postTestReports(request, h)).rejects.toThrow('PATCH failed')

      expect(request.logger.error).toHaveBeenCalledWith(
        {
          error,
          applianceId: 'APP-123',
          action: 'passed'
        },
        '[reviewTestReports] Failed to mark review test reports as passed for APP-123: PATCH failed'
      )
    })

    test('encodes the appliance id in the redirect URL', async () => {
      request.params.applianceId = 'APP/123'

      request.payload = {
        action: 'failed',
        ratedOutput: ''
      }

      await postTestReports(request, h)

      expect(saveTestReportMock).toHaveBeenCalledWith(
        'APP/123',
        false,
        expect.any(Object)
      )

      expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP%2F123')
    })
  })
})
