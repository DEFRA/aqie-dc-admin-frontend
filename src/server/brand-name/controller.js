/**
 * Unified controller for brand-name form.
 *
 * Handles both:
 * - GET/POST /review-fuel/{fuelId}/brand-name (Manufacturer supplierType)
 * - GET/POST /review-fuel/{fuelId}/rebrand-name (Rebrand supplierType)
 *
 * Uses the route path to determine which content/styling to show.
 * Both routes update the same `brandName` database field.
 */
import { brandNameContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuel, saveBrandName } from './brand-name-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = brandNameContent.en

/**
 * Determines which content variant to use based on the route path.
 * @param {string} routePath - e.g., 'brand-name' or 'rebrand-name'
 * @returns {object} Content object with heading, label, error messages
 */
function getContentVariant(routePath) {
  return routePath === 'rebrand-name'
    ? {
        heading: content.rebrand.heading,
        label: content.rebrand.label,
        errorMessage: content.rebrand.error,
        fieldName: 'rebrandName',
        fieldId: 'rebrand-name'
      }
    : {
        heading: content.manufacturer.heading,
        label: content.manufacturer.label,
        errorMessage: content.manufacturer.error,
        fieldName: 'brandName',
        fieldId: 'brand-name'
      }
}

function renderBrandNamePage(h, fuelId, fuel, formValue, routePath, error) {
  const variant = getContentVariant(routePath)
  const heading = variant.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const brandNameAction = `/review-fuel/${encodeURIComponent(fuelId)}/${routePath}`

  return h.view('brand-name/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content: {
      ...variant,
      ...content.common
    },
    fuel,
    formValue,
    error,
    fuelDetailsHref,
    brandNameAction
  })
}

/**
 * GET handler: Display the brand-name form with current value pre-populated.
 * Falls back to fuel.name if brandName is not yet set.
 *
 * @param {object} request - Hapi request
 * @param {object} h - Hapi response toolkit
 * @returns {Promise} Rendered page or error page
 */
async function handleBrandNameRequest(request, h) {
  const { fuelId } = request.params
  const routePath = request.route.path.split('/').pop() // 'brand-name' or 'rebrand-name'

  try {
    const { data: fuel } = await getFuel(fuelId)

    return renderBrandNamePage(
      h,
      fuelId,
      fuel,
      fuel.brandName ?? fuel.name ?? '',
      routePath,
      null
    )
  } catch (error) {
    logger.error(`[brandName] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.common.genericError })
      .code(statusCodes.internalServerError)
  }
}

/**
 * POST handler: Validate and save the brand name.
 * - Trims whitespace from input
 * - Returns validation error if input is empty
 * - Saves to backend if valid
 * - Returns error page on backend failure
 *
 * @param {object} request - Hapi request with fuelId and payload
 * @param {object} h - Hapi response toolkit
 * @returns {Promise} Redirect or re-rendered form with error
 */
async function handleBrandNameDecisionRequest(request, h) {
  const { fuelId } = request.params
  const routePath = request.route.path.split('/').pop() // 'brand-name' or 'rebrand-name'
  const variant = getContentVariant(routePath)
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const brandNameValue = request.payload[variant.fieldName] ?? ''
  const trimmed = brandNameValue.trim()

  try {
    if (!trimmed) {
      const { data: fuel } = await getFuel(fuelId)

      return renderBrandNamePage(h, fuelId, fuel, brandNameValue, routePath, {
        field: variant.fieldName,
        message: variant.errorMessage,
        href: `#${variant.fieldId}`
      }).code(statusCodes.badRequest)
    }

    await saveBrandName(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[brandName] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.common.genericError })
      .code(statusCodes.internalServerError)
  }
}

const brandNameController = {
  handler: handleBrandNameRequest
}

const brandNameDecisionController = {
  handler: handleBrandNameDecisionRequest
}

export {
  handleBrandNameRequest,
  handleBrandNameDecisionRequest,
  brandNameController,
  brandNameDecisionController
}
