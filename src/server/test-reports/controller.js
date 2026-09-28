import { testReportContent } from './content.js'
import { getAppliance, saveTestReport } from './test-reports-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getTestReportValues,
  testReportFields,
  validatePassedTestReport
} from './validation.js'

const VIEW_NAME = 'test-reports/index'
const content = testReportContent.en

const ACTIONS = Object.freeze({
  passed: 'passed',
  failed: 'failed'
})

const REVIEW_RESULT = Object.freeze({
  passed: true,
  failed: false
})

const getApplianceId = (request) => {
  return request.params.applianceId
}

const getPreviousPageUrl = (applianceId) => {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

/**
 * Extracts the appliance data from the supported service response shapes.
 */
const getApplianceData = (appliance = {}) => {
  return appliance.data ?? appliance
}

/**
 * Extracts the appliance name from the technical-review response.
 */
const getApplianceName = (appliance = {}) => {
  const applianceData = getApplianceData(appliance)

  return applianceData.modelName ?? applianceData.applianceName ?? 'appliance'
}

/**
 * Extracts the previously saved test-report check.
 *
 * This supports the possible technical-review response shapes:
 *
 * testReports: {
 *   result: true,
 *   data: {}
 * }
 *
 * checks: {
 *   testReports: {
 *     result: true,
 *     data: {}
 *   }
 * }
 *
 * technicalReview: {
 *   checks: {
 *     testReports: {
 *       result: true,
 *       data: {}
 *     }
 *   }
 * }
 */
const getTestReportCheck = (appliance = {}) => {
  const applianceData = getApplianceData(appliance)

  return (
    applianceData.testReports ??
    applianceData.checks?.testReports ??
    applianceData.technicalReview?.checks?.testReports ??
    {}
  )
}

/**
 * Extracts existing test-report values from the appliance
 * technical-review response.
 */
const getExistingValues = (appliance = {}) => {
  const testReportCheck = getTestReportCheck(appliance)
  const testReportData = testReportCheck.data ?? testReportCheck

  const testResults = testReportData.testResults ?? testReportData

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
 * Failed reports do not validate measurement values. The submitted
 * value is retained as a trimmed string.
 */
const toFailedValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

/**
 * Creates the test-report data for a passed review.
 *
 * The review result is passed separately to saveTestReport().
 */
const createPassedTestReport = (values) => ({
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
 * Creates the test-report data for a failed review.
 *
 * The review result is passed separately to saveTestReport().
 */
const createFailedTestReport = (values) => ({
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
    const appliance = await getAppliance(applianceId)

    return h.view(
      VIEW_NAME,
      createViewModel({
        applianceId,
        applianceName: getApplianceName(appliance),
        values: getExistingValues(appliance)
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
        statusCode: statusCodes.badRequest,
        error: 'Bad Request',
        message: 'Select an action'
      })
      .code(statusCodes.badRequest)
  }

  /*
   * Mark as failed.
   *
   * Passed-field validation is not executed.
   * Every submitted measurement value is retained as a string.
   */
  if (action === ACTIONS.failed) {
    const values = getTestReportValues(payload)
    const testReport = createFailedTestReport(values)

    try {
      await saveTestReport(applianceId, REVIEW_RESULT.failed, testReport)

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
   * Mark as passed.
   *
   * All five measurement fields are required.
   * Each value must be a valid non-negative number.
   */
  const validation = validatePassedTestReport(payload)

  if (!validation.isValid) {
    let appliance = {}

    try {
      /*
       * Reload only the appliance display information.
       * Submitted values are taken from validation.values so that
       * the user's entries remain visible.
       */
      appliance = await getAppliance(applianceId)
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
          applianceName: getApplianceName(appliance),
          values: validation.values,
          errors: validation.errors,
          errorList: validation.errorList
        })
      )
      .code(statusCodes.badRequest)
  }

  const testReport = createPassedTestReport(validation.values)

  try {
    await saveTestReport(applianceId, REVIEW_RESULT.passed, testReport)

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
