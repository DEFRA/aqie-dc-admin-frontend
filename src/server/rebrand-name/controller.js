/**
 * Controller logic for the rebrand-name form.
 *
 * GET loads the current fuel and pre-populates the form. POST trims the value,
 * validates that a rebranded name has been entered, and either saves it or
 * returns a bad-request error summary. On success, the user is returned to the
 * fuel details screen.
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
  const rebrandNameAction = `/rebrand-name/${encodeURIComponent(fuelId)}`

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
