/**
 * Controller logic for the brand-name form.
 *
 * GET loads the current fuel and pre-populates the form with existing brandName.
 * POST validates the user input, trims whitespace, and either:
 *   - Returns a validation error if empty
 *   - Saves to backend and redirects to fuel details on success
 *   - Returns error page if backend save fails
 */
import { brandNameContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelForBrandName, saveBrandName } from './brand-name-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = brandNameContent.en

function renderBrandNamePage(h, fuelId, fuel, formValue, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const brandNameAction = `/review-fuel/${encodeURIComponent(fuelId)}/brand-name`

  return h.view('brand-name/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
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

  try {
    const { data: fuel } = await getFuelForBrandName(fuelId)

    return renderBrandNamePage(
      h,
      fuelId,
      fuel,
      fuel.brandName ?? fuel.name ?? '',
      null
    )
  } catch (error) {
    logger.error(`[brandName] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
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
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const brandNameValue = request.payload.brandName ?? ''
  const trimmed = brandNameValue.trim()

  try {
    if (!trimmed) {
      const { data: fuel } = await getFuelForBrandName(fuelId)

      return renderBrandNamePage(h, fuelId, fuel, brandNameValue, {
        field: 'brandName',
        message: content.errors.brandNameRequired,
        href: '#brandName'
      }).code(statusCodes.badRequest)
    }

    await saveBrandName(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[brandName] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
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
