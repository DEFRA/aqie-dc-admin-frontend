import Boom from '@hapi/boom'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { testResultsContent } from './content.js'
import {
  getFuelTechnicalReview,
  saveFuelTechnicalReview
} from './test-results-data.js'
import {
  getTestResultsValues,
  toNumberOrNull,
  validatePassedTestResults,
  validateFailedTestResults
} from './validation.js'

const logger = createLogger()
const content = testResultsContent.en
const VIEW_NAME = 'test-results/index'

const getFuelId = (request) => request.params.fuelId

const getPreviousPageUrl = (fuelId) =>
  `/review-fuel/${encodeURIComponent(fuelId)}`

const getFuelName = (fuel = {}) => {
  return fuel.name || 'fuel'
}

const getExistingValues = (fuel = {}) => {
  const responseData = fuel.data ?? fuel
  const testResults = responseData.testResults ?? responseData

  return getTestResultsValues(testResults)
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
    const { data: fuel } = await getFuelTechnicalReview(fuelId)

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
  const result = payload.result === true

  if (typeof payload.result === 'undefined') {
    throw Boom.badRequest('Select an action')
  }

  const validation = result
    ? validatePassedTestResults(payload)
    : validateFailedTestResults(payload)

  if (!validation.isValid) {
    let fuel = {}

    try {
      const { data } = await getFuelTechnicalReview(fuelId)
      fuel = data
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
