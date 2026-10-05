import Boom from '@hapi/boom'
import { createLogger } from '../common/helpers/logging/logger.js'
import { testReportContent } from './content.js'
import { getTestReport, updateTestReport } from './test-reports-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getTestReportValues,
  testReportFields,
  validatePassedTestReport,
  validateFailedTestReport,
  decimalPattern
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
 * Converts empty or invalid failed-report values to null.
 * Valid numeric values are rounded to two decimal places.
 *
 * Empty fields (empty strings or non-numeric values) are converted to null
 * so they are explicitly included in the update payload and properly clear
 * the database fields, rather than being omitted and leaving old values intact.
 *
 * Examples:
 * ''          -> null (cleared)
 * '  '        -> null (cleared)
 * 'abc'       -> null (invalid, cleared)
 * '-1'        -> null (invalid format for failed report, cleared)
 * '5.2'       -> 5.2 (valid, saved)
 * '5.678'     -> 5.68 (valid, rounded to 2 decimals)
 */
const toOptionalNumber = (value) => {
  const trimmed = String(value ?? '').trim()

  if (trimmed === '' || !decimalPattern.test(trimmed)) {
    return null
  }

  return toRoundedNumber(trimmed)
}

/**
 * Creates the test results data for the backend payload.
 *
 * For passed reports: all values are numbers rounded to two decimal places.
 * For failed reports: all values are retained as submitted (empty strings, alphabetic, etc).
 */
const createTestResults = (values, isPassed) => {
  const valueConverter = isPassed ? toRoundedNumber : toOptionalNumber

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
   * Empty fields are allowed and optional.
   * Non-empty fields must be valid numbers (same format validation as passed reports).
   * This ensures data consistency while allowing incomplete failed reports.
   * All submitted values are retained as strings (empty strings for empty values).
   * Surrounding spaces are trimmed from all values.
   */
  if (action === ACTIONS.failed) {
    const validation = validateFailedTestReport(payload)

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
        REVIEW_STATUS.failed,
        createTestResults(validation.values, false)
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
