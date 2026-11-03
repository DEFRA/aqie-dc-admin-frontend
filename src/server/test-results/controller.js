import Boom from '@hapi/boom'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { testResultsContent } from './content.js'
import {
  getFuelTechnicalReview,
  saveFuelTechnicalReview
} from './test-results-data.js'
import {
  validatePassedTestResults,
  validateFailedTestResults
} from './validation.js'

const logger = createLogger()
const content = testResultsContent.en
const VIEW_NAME = 'test-results/index'

const getFuelId = (request) => request.params.fuelId

const getPreviousPageUrl = (fuelId) =>
  `/review-fuel/${encodeURIComponent(fuelId)}`

const getResponseData = (payload = {}) => {
  if (payload && payload.data) {
    return payload.data
  }

  return payload
}

const getFuelName = (fuel = {}) => {
  const fuelData = getResponseData(fuel)

  return fuelData.name || 'fuel'
}

const getExistingValues = (fuel = {}) => {
  const fuelData = getResponseData(fuel)
  const testResults = fuelData.testResults || {}

  return {
    smokeEmission:
      typeof testResults.smokeEmission === 'undefined'
        ? ''
        : testResults.smokeEmission,
    sulphurContent:
      typeof testResults.sulphurContent === 'undefined'
        ? ''
        : testResults.sulphurContent
  }
}

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const trimmed = String(value).trim()

  if (trimmed === '') {
    return null
  }

  return Number(trimmed)
}

const createViewModel = ({
  fuelId,
  fuelName,
  values = {},
  errors = {},
  errorList = []
}) => ({
  pageTitle: `${content.pageTitlePrefix} ${fuelName}`,
  intro: content.intro,
  submitPassed: content.submitPassed,
  submitFailed: content.submitFailed,
  cancel: content.cancel,
  errorSummaryTitle: content.errorSummaryTitle,
  previousPageUrl: getPreviousPageUrl(fuelId),
  formAction: `/review-fuel/${encodeURIComponent(fuelId)}/test-results`,
  fields: content.fields,
  values,
  errors,
  errorList,
  hasErrors: errorList.length > 0,
  fuelId,
  fuelName
})

export const getTestResults = async (request, h) => {
  const fuelId = getFuelId(request)

  try {
    const response = await getFuelTechnicalReview(fuelId)
    const fuel = response.data ?? response

    return h.view(
      VIEW_NAME,
      createViewModel({
        fuelId,
        fuelName: getFuelName(fuel),
        values: getExistingValues(fuel)
      })
    )
  } catch (error) {
    logger.error(
      `[testResults] failed to load fuel technical review for ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const postTestResults = async (request, h) => {
  const fuelId = getFuelId(request)
  const payload = request.payload ?? {}
  const result = payload.result === true || payload.result === 'true'

  if (typeof payload.result === 'undefined') {
    throw Boom.badRequest('Select an action')
  }

  const validation = result
    ? validatePassedTestResults(payload)
    : validateFailedTestResults(payload)

  if (!validation.isValid) {
    let fuel = {}

    try {
      const response = await getFuelTechnicalReview(fuelId)
      fuel = response.data ?? response
    } catch (error) {
      logger.warn(
        `[testResults] unable to reload fuel details after validation failure for ${fuelId}: ${error.message}`
      )
    }

    return h
      .view(
        VIEW_NAME,
        createViewModel({
          fuelId,
          fuelName: getFuelName(fuel),
          values: validation.values,
          errors: validation.errors,
          errorList: validation.errorList
        })
      )
      .code(statusCodes.badRequest)
  }

  try {
    await saveFuelTechnicalReview(fuelId, result, {
      smokeEmission: toNumberOrNull(validation.values.smokeEmission),
      sulphurContent: toNumberOrNull(validation.values.sulphurContent)
    })

    return h.redirect(getPreviousPageUrl(fuelId))
  } catch (error) {
    logger.error(
      `[testResults] failed to save technical review for ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}
