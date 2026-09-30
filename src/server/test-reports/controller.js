import Boom from '@hapi/boom'
import { createLogger } from '../common/helpers/logging/logger.js'
import { testReportContent } from './content.js'
import { getTestReport, updateTestReport } from './test-reports-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getTestReportValues,
  testReportFields,
  validatePassedTestReport
} from './validation.js'

const logger = createLogger()
const VIEW_NAME = 'test-reports/index'
const content = testReportContent.en

const ACTIONS = Object.freeze({
  passed: 'passed',
  failed: 'failed'
})

const REVIEW_STATUS = Object.freeze({
  passed: true,
  failed: false
})

const getApplianceId = (request) => {
  return request.params.applianceId
}

const getPreviousPageUrl = (applianceId) => {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

const getApplianceName = (testReport = {}) => {
  const responseData = testReport.data ?? testReport

  return responseData.modelName ?? 'appliance'
}

/**
 * Extracts test-report values from supported backend response shapes.
 */
const getExistingValues = (testReport = {}) => {
  const responseData = testReport.data ?? testReport
  const testResults = responseData.testResults ?? responseData

  return getTestReportValues(testResults)
}

const createViewModel = ({
  applianceId,
  applianceName,
  values = {},
  errors = {},
  errorList = []
}) => ({
  ...content,
  applianceId,
  applianceName,
  pageTitle: `${content.pageTitlePrefix} ${applianceName}`,
  previousPageUrl: getPreviousPageUrl(applianceId),
  fields: testReportFields,
  values,
  errors,
  errorList,
  hasErrors: errorList.length > 0
})

/**
 * Converts a passed test-report value to a number
 * rounded to a maximum of two decimal places.
 *
 * Examples:
 * 5       -> 5
 * 5.2     -> 5.2
 * 5.678   -> 5.68
 * 1.005   -> 1.01
 */
const toRoundedNumber = (value) => {
  const number = Number(value)

  return Math.round((number + Number.EPSILON) * 100) / 100
}

/**
 * Keeps the submitted value as a string when the report is marked as failed.
 *
 * Failed reports do not validate measurement values.
 * All values are retained in their submitted form (as strings) to preserve
 * user input, including:
 * - empty strings
 * - numeric strings (e.g., '10.5', '-1', '0')
 * - alphabetic strings (e.g., 'abc', 'N/A')
 * - alphanumeric strings (e.g., '1abc')
 * - null/undefined (converted to empty string '')
 *
 * Surrounding spaces are trimmed from all values.
 *
 * The value is stored as a string because failed values can contain
 * non-numeric content that should not be validated or coerced.
 */
const toFailedValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

/**
 * Creates the test results data for the backend payload.
 *
 * For passed reports: all values are numbers rounded to two decimal places.
 * For failed reports: all values are retained as submitted (empty strings, alphabetic, etc).
 */
const createTestResults = (values, isPassed) => {
  const valueConverter = isPassed ? toRoundedNumber : toFailedValue

  return {
    ratedOutput: valueConverter(values.ratedOutput),
    testedOutput: {
      rated: valueConverter(values.testedOutputRated),
      low: valueConverter(values.testedOutputLow)
    },
    smokeEmissionOutput: {
      rated: valueConverter(values.smokeEmissionOutputRated),
      low: valueConverter(values.smokeEmissionOutputLow)
    }
  }
}

export const getTestReports = async (request, h) => {
  const applianceId = getApplianceId(request)

  try {
    const testReport = await getTestReport(applianceId)

    return h.view(
      VIEW_NAME,
      createViewModel({
        applianceId,
        applianceName: getApplianceName(testReport),
        values: getExistingValues(testReport)
      })
    )
  } catch (error) {
    logger.error(
      `[reviewTestReports] Failed to load review test reports for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const postTestReports = async (request, h) => {
  const applianceId = getApplianceId(request)
  const payload = request.payload ?? {}
  const action = payload.action

  if (!Object.values(ACTIONS).includes(action)) {
    throw Boom.badRequest('Select an action')
  }

  /*
   * Mark as failed:
   *
   * Do not run passed-field validation.
   * All five measurements are optional.
   * All submitted values are retained as strings (empty strings for empty values).
   * Surrounding spaces are trimmed from all values.
   */
  if (action === ACTIONS.failed) {
    const values = getTestReportValues(payload)

    try {
      await updateTestReport(
        applianceId,
        REVIEW_STATUS.failed,
        createTestResults(values, false)
      )

      return h.redirect(getPreviousPageUrl(applianceId))
    } catch (error) {
      logger.error(
        `[reviewTestReports] Failed to mark review test reports for ${applianceId}: ${error.message}`
      )

      return h
        .view('error/index', { message: content.errors.generic })
        .code(statusCodes.internalServerError)
    }
  }

  /*
   * Mark as passed:
   *
   * All five measurement fields are required.
   * Each value must be a non-negative whole number or decimal.
   */
  const validation = validatePassedTestReport(payload)

  if (!validation.isValid) {
    let testReport = {}

    try {
      /*
       * Reload the display information.
       * The submitted values come from validation.values so the
       * user's entries remain visible.
       */
      testReport = await getTestReport(applianceId)
    } catch (error) {
      logger.warn(
        `[reviewTestReports] Unable to reload appliance details after validation failure for ${applianceId}: ${error.message}`
      )
    }

    return h
      .view(
        VIEW_NAME,
        createViewModel({
          applianceId,
          applianceName: getApplianceName(testReport),
          values: validation.values,
          errors: validation.errors,
          errorList: validation.errorList
        })
      )
      .code(statusCodes.badRequest)
  }

  try {
    await updateTestReport(
      applianceId,
      REVIEW_STATUS.passed,
      createTestResults(validation.values, true)
    )

    return h.redirect(getPreviousPageUrl(applianceId))
  } catch (error) {
    logger.error(
      `[reviewTestReports] Failed to mark review test reports as passed for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}
