/**
 * Unified controller for additional brand names form.
 *
 * Handles both:
 * - GET/POST /review-fuel/{fuelId}/additional-brand-names (Manufacturer supplierType)
 * - GET/POST /review-fuel/{fuelId}/additional-rebrand-names (Rebrand supplierType)
 *
 * Uses the route path to determine which content/styling to show.
 * Both routes update the same `additionalBrandNames` database field.
 */
import { additionalBrandNamesContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelForAdditionalBrandNames,
  saveAdditionalBrandNames
} from './additional-brand-names-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getAdditionalBrandNamesValues,
  validateAdditionalBrandNames
} from './validation.js'

const logger = createLogger()
const content = additionalBrandNamesContent.en

/**
 * Determines which content variant to use based on the route path.
 * @param {string} routePath - e.g., 'additional-brand-names' or 'additional-rebrand-names'
 * @returns {object} Content object with heading, labels, error messages
 */
function getContentVariant(routePath) {
  return routePath === 'additional-rebrand-names'
    ? {
        heading: content.rebrand.heading,
        brandsLabel: content.rebrand.brandsLabel,
        brandsHint: content.rebrand.brandsHint,
        brandsRequired: content.rebrand.brandsRequired,
        fieldName: 'additionalRebrandBrands',
        fieldId: 'additional-rebrand-brands'
      }
    : {
        heading: content.manufacturer.heading,
        brandsLabel: content.manufacturer.brandsLabel,
        brandsHint: content.manufacturer.brandsHint,
        brandsRequired: content.manufacturer.brandsRequired,
        fieldName: 'additionalBrands',
        fieldId: 'additional-brands'
      }
}

function renderAdditionalBrandNamesPage(
  h,
  fuelId,
  fuel,
  formData,
  routePath,
  error
) {
  const variant = getContentVariant(routePath)
  const heading = variant.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const action = `/review-fuel/${encodeURIComponent(fuelId)}/${routePath}`

  const formValues = formData ?? getAdditionalBrandNamesValues(fuel)
  const additionalBrandNamesValue = formValues.additionalBrandNames
  const hasAdditionalBrandNames = formValues.hasAdditionalBrandNames

  return h.view('additional-brand-names/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content: {
      ...variant,
      ...content.common
    },
    fuel,
    hasAdditionalBrandNames,
    additionalBrandNamesValue,
    error,
    fuelDetailsHref,
    action
  })
}

async function handleAdditionalBrandNamesRequest(request, h) {
  const { fuelId } = request.params
  const routePath = request.route.path.split('/').pop()

  try {
    const { data: fuel } = await getFuelForAdditionalBrandNames(fuelId)

    return renderAdditionalBrandNamesPage(
      h,
      fuelId,
      fuel,
      getAdditionalBrandNamesValues(fuel),
      routePath,
      null
    )
  } catch (error) {
    logger.error(
      `[additionalBrandNames] failed to load ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.common.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleAdditionalBrandNamesDecisionRequest(request, h) {
  const { fuelId } = request.params
  const routePath = request.route.path.split('/').pop()
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const payload = request.payload ?? {}
  const validation = validateAdditionalBrandNames(payload)

  try {
    if (!validation.isValid) {
      const { data: fuel } = await getFuelForAdditionalBrandNames(fuelId)

      return renderAdditionalBrandNamesPage(
        h,
        fuelId,
        fuel,
        validation.values,
        routePath,
        validation.errorList[0]
      ).code(statusCodes.badRequest)
    }

    await saveAdditionalBrandNames(
      fuelId,
      validation.values.hasAdditionalBrandNames
        ? validation.values.additionalBrandNames.trim()
        : null
    )

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(
      `[additionalBrandNames] failed to save ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.common.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const additionalBrandNamesController = {
  handler: handleAdditionalBrandNamesRequest
}

const additionalBrandNamesDecisionController = {
  handler: handleAdditionalBrandNamesDecisionRequest
}

export {
  handleAdditionalBrandNamesRequest,
  handleAdditionalBrandNamesDecisionRequest,
  additionalBrandNamesController,
  additionalBrandNamesDecisionController
}
