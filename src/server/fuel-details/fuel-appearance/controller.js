import { fuelAppearanceContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  getFuelAppearance,
  saveFuelAppearance
} from './fuel-appearance-data.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelAppearanceContent.en

function renderPage(h, fuelId, formValue, error) {
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const fuelAppearanceAction = `/fuel-appearance/${encodeURIComponent(fuelId)}`

  return h.view('fuel-details/fuel-appearance/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref,
    fuelAppearanceAction
  })
}

async function handleFuelAppearanceRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelAppearance(fuelId)

    return renderPage(h, fuelId, fuel.fuelDescription.appearance ?? '', null)
  } catch (error) {
    logger.error(`[fuelAppearance] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelAppearanceSaveRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const appearance = request.payload.appearance ?? ''
  const trimmed = appearance.trim()

  try {
    if (!trimmed) {
      return renderPage(h, fuelId, appearance, {
        field: 'appearance',
        message: content.errors.appearanceRequired,
        href: '#appearance'
      }).code(statusCodes.badRequest)
    }

    await saveFuelAppearance(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[fuelAppearance] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const fuelAppearanceController = {
  handler: handleFuelAppearanceRequest
}

export const fuelAppearanceSaveController = {
  handler: handleFuelAppearanceSaveRequest
}

export { handleFuelAppearanceRequest, handleFuelAppearanceSaveRequest }
