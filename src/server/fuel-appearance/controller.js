import { fuelAppearanceContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelAppearance,
  saveFuelAppearance
} from './fuel-appearance-data.js'
import { getFuelDescriptionFieldReturnHref } from '../common/helpers/fuel-description-field-return-href.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelAppearanceContent.en

function renderPage(h, fuelId, returnHref, formValue, error) {
  return h.view('fuel-appearance/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: returnHref,
    fuelAppearanceAction: `/review-fuel/${encodeURIComponent(fuelId)}/fuel-appearance`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

async function handleFuelAppearanceRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelAppearance(fuelId)

    return renderPage(
      h,
      fuelId,
      getFuelDescriptionFieldReturnHref(fuel, fuelId),
      fuel.fuelDescription?.appearance ?? '',
      null
    )
  } catch (error) {
    logger.error(`[fuelAppearance] failed to load ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

async function handleFuelAppearanceSaveRequest(request, h) {
  const { fuelId } = request.params
  const appearance = request.payload.appearance ?? ''
  const trimmed = appearance.trim()

  try {
    const { data: fuel } = await getFuelAppearance(fuelId)
    const returnHref = getFuelDescriptionFieldReturnHref(fuel, fuelId)

    if (!trimmed) {
      return renderPage(h, fuelId, returnHref, appearance, {
        field: 'appearance',
        message: content.errors.appearanceRequired,
        href: '#appearance'
      }).code(statusCodes.badRequest)
    }

    await saveFuelAppearance(fuelId, trimmed)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(`[fuelAppearance] failed to save ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

export const fuelAppearanceController = {
  handler: handleFuelAppearanceRequest
}

export const fuelAppearanceSaveController = {
  handler: handleFuelAppearanceSaveRequest
}

export { handleFuelAppearanceRequest, handleFuelAppearanceSaveRequest }
