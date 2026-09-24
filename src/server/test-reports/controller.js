import { content } from './content.js'
import { getTestReport, updateTestReport } from './test-reports-data.js'
import {
  getTestReportValues,
  testReportFields,
  validatePassedTestReport
} from './validation.js'

const VIEW_NAME = 'test-reports/index'

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
 * Keeps the submitted value when the report is marked as failed.
 *
 * Failed reports do not validate measurement values.
 * Therefore the following values are retained:
 * - empty strings
 * - alphabetic values
 * - alphanumeric values
 * - negative values
 * - positive numbers
 *
 * The value is stored as a string because failed values can contain
 * non-numeric content.
 */
const toFailedValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

/**
 * Creates the backend payload for a passed test report.
 *
 * All values have already passed frontend validation.
 * Values are rounded to a maximum of two decimal places.
 */
const createPassedPayload = (values) => ({
  reviewStatus: REVIEW_STATUS.passed,

  ratedOutput: toRoundedNumber(values.ratedOutput),

  testedOutput: {
    rated: toRoundedNumber(values.testedOutputRated),
    low: toRoundedNumber(values.testedOutputLow)
  },

  smokeEmissionOutput: {
    rated: toRoundedNumber(values.smokeEmissionOutputRated),
    low: toRoundedNumber(values.smokeEmissionOutputLow)
  }
})

/**
 * Creates the backend payload for a failed test report.
 *
 * No measurement validation is performed when marking as failed.
 * Every submitted value is retained as a string, including an
 * empty string, negative value, alphabetic value, or alphanumeric
 * value.
 */
const createFailedPayload = (values) => ({
  reviewStatus: REVIEW_STATUS.failed,

  ratedOutput: toFailedValue(values.ratedOutput),

  testedOutput: {
    rated: toFailedValue(values.testedOutputRated),
    low: toFailedValue(values.testedOutputLow)
  },

  smokeEmissionOutput: {
    rated: toFailedValue(values.smokeEmissionOutputRated),
    low: toFailedValue(values.smokeEmissionOutputLow)
  }
})

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
    request.logger?.error(
      {
        error,
        applianceId
      },
      `[reviewTestReports] Failed to load review test reports for ${applianceId}: ${error.message}`
    )

    throw error
  }
}

export const postTestReports = async (request, h) => {
  const applianceId = getApplianceId(request)
  const payload = request.payload ?? {}
  const action = payload.action

  if (!Object.values(ACTIONS).includes(action)) {
    return h
      .response({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Select an action'
      })
      .code(400)
  }

  /*
   * Mark as failed:
   *
   * Do not run passed-field validation.
   * All five measurements are optional.
   * Valid numbers entered by the user are retained.
   * Empty or invalid optional values become null.
   */
  if (action === ACTIONS.failed) {
    const values = getTestReportValues(payload)

    try {
      await updateTestReport(applianceId, createFailedPayload(values))

      return h.redirect(getPreviousPageUrl(applianceId))
    } catch (error) {
      request.logger?.error(
        {
          error,
          applianceId,
          action
        },
        `[reviewTestReports] Failed to mark review test reports for ${applianceId}: ${error.message}`
      )

      throw error
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
      request.logger?.warn(
        {
          error,
          applianceId
        },
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
      .code(400)
  }

  try {
    await updateTestReport(applianceId, createPassedPayload(validation.values))

    return h.redirect(getPreviousPageUrl(applianceId))
  } catch (error) {
    request.logger?.error(
      {
        error,
        applianceId,
        action
      },
      `[reviewTestReports] Failed to mark review test reports as passed for ${applianceId}: ${error.message}`
    )

    throw error
  }
}
