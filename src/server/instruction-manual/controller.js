import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { instructionManualContent } from './content.js'
import {
  getAppliance,
  saveInstructionManual
} from './instruction-manual-data.js'
import {
  buildPublicationDate,
  normaliseInstructionManualPayload,
  splitPublicationDate,
  validateInstructionManual
} from './validation.js'

const logger = createLogger()
const content = instructionManualContent.en

/**
 * Builds the parent appliance review page URL.
 *
 * @param {string} applianceId - Appliance identifier.
 * @returns {string} Encoded review URL.
 */
function buildReviewHref(applianceId) {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

/**
 * Returns the persisted instruction-manual data.
 *
 * The fallback locations make the page compatible with common technical-review
 * response shapes while keeping data-shape handling in one place.
 *
 * @param {object} appliance - Appliance returned by the API.
 * @returns {object} Stored instruction-manual data.
 */
function getStoredInstructionManual(appliance) {
  return (
    appliance?.instructionManual ??
    appliance?.technicalReview?.instructionManual ??
    appliance?.technicalReview?.checks?.instructionManual?.data
      ?.instructionManual ??
    appliance?.technicalReview?.checks?.instructionManual?.data ??
    {}
  )
}

/**
 * Builds editable form values from persisted appliance data.
 *
 * @param {object} appliance - Appliance returned by the API.
 * @returns {object} Form values.
 */
function getSavedFormValues(appliance) {
  const saved = getStoredInstructionManual(appliance)
  const dateParts = splitPublicationDate(saved.publicationDate)
  const hasSavedVersion = Object.keys(saved).length > 0
  const hasVersion =
    typeof saved.version === 'string'
      ? saved.version.trim().length > 0
      : Boolean(saved.version)
  const includeVersion = hasVersion ? 'yes' : hasSavedVersion ? 'no' : ''

  return {
    title: saved.title ?? '',
    includeVersion,
    version: saved.version ?? '',
    ...dateParts
  }
}

/**
 * Returns the first error for a particular field.
 *
 * @param {Array<object>} errors - Validation errors.
 * @param {string} field - Required field name.
 * @returns {object|null} Matching error or null.
 */
function findError(errors, field) {
  return errors.find((error) => error.field === field) ?? null
}

/**
 * Builds the Nunjucks view model.
 *
 * @param {object} appliance - Appliance being reviewed.
 * @param {object} formValues - Values displayed in the form.
 * @param {Array<object>} errors - Validation errors.
 * @returns {object} Nunjucks page model.
 */
function buildPageViewModel(
  appliance,
  formValues = getSavedFormValues(appliance),
  errors = []
) {
  const hasErrors = errors.length > 0
  const heading = `${content.title} for ${appliance.modelName}`

  return {
    pageTitle: hasErrors ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    reviewHref: buildReviewHref(appliance.id),
    formValues,
    errors,
    errorList: errors.map((error) => ({
      text: error.message,
      href: error.href
    })),
    hasErrors,
    fieldErrors: {
      title: findError(errors, 'title'),
      includeVersion: findError(errors, 'includeVersion'),
      version: findError(errors, 'version'),
      publicationDate: findError(errors, 'publicationDate')
    }
  }
}

/**
 * Renders the shared service error page.
 *
 * @param {object} h - Hapi response toolkit.
 * @returns {object} Service error response.
 */
function renderServiceError(h) {
  return h
    .view('error/index', {
      message: content.errors.generic
    })
    .code(statusCodes.internalServerError)
}

/**
 * Converts form values into the persisted instruction-manual structure.
 *
 * @param {object} values - Normalised form values.
 * @param {boolean} includePublicationDate - Whether the date is validated.
 * @returns {object} Persisted instruction-manual data.
 */
function buildInstructionManualData(values, includePublicationDate = true) {
  const version = values.includeVersion === 'yes' ? values.version : ''

  return {
    title: values.title,
    version,
    publicationDate: includePublicationDate
      ? buildPublicationDate(values)
      : null
  }
}

/**
 * Builds failed-review data without requiring valid mandatory fields.
 *
 * A complete real publication date is retained. Incomplete or malformed dates
 * are stored as null because they cannot safely be represented as an ISO date.
 *
 * @param {object} values - Normalised submitted values.
 * @returns {object} Data saved for a failed review.
 */
function buildFailedInstructionManualData(values) {
  const dateValidation = validateInstructionManual({
    ...values,
    title: values.title || 'temporary-title-for-date-validation',
    includeVersion: values.includeVersion || 'no'
  })

  const hasDateError = dateValidation.errors.some(
    (error) => error.field === 'publicationDate'
  )

  return buildInstructionManualData(values, !hasDateError)
}

/**
 * Loads the instruction-manual review page.
 *
 * @param {object} request - Hapi request.
 * @param {object} h - Hapi response toolkit.
 * @returns {Promise<object>} Rendered page or service error.
 */
export async function handleInstructionManualRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data } = await getAppliance(applianceId)

    const appliance = {
      ...data,
      id: data?.id ?? data?.applianceId ?? applianceId
    }

    return h.view('instruction-manual/index', buildPageViewModel(appliance))
  } catch (error) {
    logger.error(
      `[instructionManual] failed to load ${applianceId}: ${error.message}`
    )

    return renderServiceError(h)
  }
}

/**
 * Handles Mark as passed and Mark as failed submissions.
 *
 * Mark as passed validates the required fields.
 * Mark as failed saves without mandatory-field validation.
 *
 * @param {object} request - Hapi request.
 * @param {object} h - Hapi response toolkit.
 * @returns {Promise<object>} Validation response, redirect, or service error.
 */
export async function handleInstructionManualDecisionRequest(request, h) {
  const { applianceId } = request.params
  const values = normaliseInstructionManualPayload(request.payload)

  try {
    const { data } = await getAppliance(applianceId)

    const appliance = {
      ...data,
      id: data?.id ?? data?.applianceId ?? applianceId
    }

    if (values.action === 'failed') {
      await saveInstructionManual(
        applianceId,
        false,
        buildFailedInstructionManualData(values)
      )

      return h.redirect(buildReviewHref(applianceId))
    }

    const validation = validateInstructionManual(values)

    if (validation.errors.length > 0) {
      return h
        .view(
          'instruction-manual/index',
          buildPageViewModel(appliance, validation.values, validation.errors)
        )
        .code(statusCodes.badRequest)
    }

    const instructionManual = buildInstructionManualData(validation.values)

    await saveInstructionManual(applianceId, true, instructionManual)

    return h.redirect(buildReviewHref(applianceId))
  } catch (error) {
    logger.error(
      `[instructionManual] failed to save ${applianceId}: ${error.message}`
    )

    return renderServiceError(h)
  }
}

export { buildPageViewModel, getSavedFormValues, buildInstructionManualData }
