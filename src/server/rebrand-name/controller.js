/**
 * Controller logic for the rebrand-name form.
 *
 * Imports the core form handler from brand-name and wraps it with rebrand-specific
 * content and naming. Both routes update the same `brandName` database field,
 * but with different wording and contexts:
 * - rebrand-name: for "Rebrand" supplierType (titled "rebranded name")
 * - brand-name: for "Manufacturer" supplierType (titled "brand name")
 */
import { rebrandNameContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelForRebrandName, saveRebrandName } from './rebrand-name-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = rebrandNameContent.en

function renderRebrandNamePage(h, fuelId, fuel, formValue, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const rebrandNameAction = `/review-fuel/${encodeURIComponent(fuelId)}/rebrand-name`

  return h.view('rebrand-name/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
    fuel,
    formValue,
    error,
    fuelDetailsHref,
    rebrandNameAction
  })
}

/**
 * GET handler: Display the rebrand-name form with current value pre-populated.
 * Falls back to fuel.name if brandName is not yet set.
 *
 * @param {object} request - Hapi request
 * @param {object} h - Hapi response toolkit
 * @returns {Promise} Rendered page or error page
 */
async function handleRebrandNameRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelForRebrandName(fuelId)

    return renderRebrandNamePage(
      h,
      fuelId,
      fuel,
      fuel.brandName ?? fuel.name ?? '',
      null
    )
  } catch (error) {
    logger.error(`[rebrandName] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

/**
 * POST handler: Validate and save the rebranded name.
 * - Trims whitespace from input
 * - Returns validation error if input is empty
 * - Saves to backend if valid
 * - Returns error page on backend failure
 *
 * @param {object} request - Hapi request with fuelId and payload
 * @param {object} h - Hapi response toolkit
 * @returns {Promise} Redirect or re-rendered form with error
 */
async function handleRebrandNameDecisionRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const rebrandNameValue = request.payload.rebrandName ?? ''
  const trimmed = rebrandNameValue.trim()

  try {
    if (!trimmed) {
      const { data: fuel } = await getFuelForRebrandName(fuelId)

      return renderRebrandNamePage(h, fuelId, fuel, rebrandNameValue, {
        field: 'rebrandName',
        message: content.errors.rebrandNameRequired,
        href: '#rebrand-name'
      }).code(statusCodes.badRequest)
    }

    await saveRebrandName(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[rebrandName] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const rebrandNameController = {
  handler: handleRebrandNameRequest
}

const rebrandNameDecisionController = {
  handler: handleRebrandNameDecisionRequest
}

export {
  handleRebrandNameRequest,
  handleRebrandNameDecisionRequest,
  rebrandNameController,
  rebrandNameDecisionController
}
