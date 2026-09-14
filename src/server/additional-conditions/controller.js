import { createLogger } from '../common/helpers/logging/logger.js'
import { additionalConditionsContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getAppliance,
  saveAdditionalConditions
} from './additional-conditions-data.js'

const logger = createLogger()
const content = additionalConditionsContent.en
const maximumCharacters = content.characterCount.limit

/**
 * Builds the return URL to the parent review page after saving or cancelling.
 *
 * @param {string} applianceId - The appliance identifier.
 * @returns {string} The encoded review page URL.
 */
function buildReviewHref(applianceId) {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

/**
 * Builds the Nunjucks view model for the additional-conditions page.
 *
 * @param {object} appliance - The appliance being reviewed.
 * @param {string} [previousValue=''] - The previously entered text value.
 * @param {object} [errorMessage] - GOV.UK error message payload.
 * @returns {object} The view model used by the template.
 */
function buildPageViewModel(appliance, previousValue = '', errorMessage) {
  return {
    pageTitle: `${content.title} for ${appliance.modelName}`,
    heading: `${content.title} for ${appliance.modelName}`,
    content,
    appliance,
    reviewHref: buildReviewHref(appliance.id),
    additionalConditionsValue: previousValue,
    errorMessage,
    maxLength: maximumCharacters
  }
}

/**
 * Fetches the appliance record required to re-render the form with validation feedback.
 *
 * @param {string} applianceId - The appliance identifier.
 * @returns {Promise<object>} The appliance record.
 */
async function getApplianceForReview(applianceId) {
  const { data: appliance } = await getAppliance(applianceId)
  return appliance
}

/**
 * Renders the page with a validation error after the user submits an invalid value.
 *
 * @param {object} h - The Hapi response toolkit.
 * @param {object} appliance - The appliance currently being reviewed.
 * @param {string} previousValue - The raw textarea content.
 * @param {string} errorMessageText - The GOV.UK error text.
 * @returns {object} The rendered page response.
 */
function renderValidationError(h, appliance, previousValue, errorMessageText) {
  const viewModel = buildPageViewModel(appliance, previousValue, {
    text: errorMessageText
  })

  return h.view('additional-conditions/index', viewModel).code(400)
}

/**
 * Renders the shared service error page for unexpected failures.
 *
 * @param {object} h - The Hapi response toolkit.
 * @returns {object} The error response.
 */
function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

/**
 * Loads the additional-conditions page for the selected appliance.
 *
 * @param {object} request - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 * @returns {Promise<object>} The rendered page response.
 */
async function handleAdditionalConditionsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getAppliance(applianceId)

    return h.view(
      'additional-conditions/index',
      buildPageViewModel(appliance, '')
    )
  } catch (error) {
    logger.error(
      `[additionalConditions] failed to load ${applianceId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

/**
 * Validates and saves the additional conditions submission before returning the user
 * to the appliance review page.
 *
 * @param {object} request - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 * @returns {Promise<object>} The redirect or validation response.
 */
async function handleAdditionalConditionsDecisionRequest(request, h) {
  const { applianceId } = request.params
  const additionalConditions = request.payload.additionalConditions ?? ''
  const isComplete = request.payload.decision === 'complete'

  try {
    // The field must contain meaningful text, or the user must explicitly enter
    // the permitted wording "No additional conditions for use".
    if (additionalConditions.trim().length === 0) {
      const appliance = await getApplianceForReview(applianceId)
      return renderValidationError(
        h,
        appliance,
        additionalConditions,
        content.characterCount.empty
      )
    }

    if (additionalConditions.length > maximumCharacters) {
      const appliance = await getApplianceForReview(applianceId)
      const overBy = additionalConditions.length - maximumCharacters
      return renderValidationError(
        h,
        appliance,
        additionalConditions,
        content.characterCount.limitExceeded(overBy)
      )
    }

    await saveAdditionalConditions(applianceId, isComplete)

    return h.redirect(buildReviewHref(applianceId))
  } catch (error) {
    logger.error(
      `[additionalConditions] failed to save ${applianceId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

export {
  handleAdditionalConditionsRequest,
  handleAdditionalConditionsDecisionRequest
}
