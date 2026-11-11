import { fuelAppearanceContent } from '../../fuel-details/fuel-appearance/content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  getFuelAppearance,
  saveFuelAppearance
} from '../../fuel-details/fuel-appearance/fuel-appearance-data.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelAppearanceContent.en

function renderPage(h, fuelId, formValue, error) {
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/fuel-appearance/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: `/review-fuel/${encoded}/fuel-description`,
    fuelAppearanceAction: `/review-fuel/${encoded}/fuel-description/fuel-appearance`
  })
}

async function handleFuelDescriptionFuelAppearanceRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelAppearance(fuelId)
    const desc = fuel.fuelDescription ?? {}

    return renderPage(h, fuelId, desc.appearance ?? '', null)
  } catch (error) {
    logger.error(
      `[fuelDescriptionFuelAppearance] failed to load ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelDescriptionFuelAppearanceSaveRequest(request, h) {
  const { fuelId } = request.params
  const fuelDescriptionHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-description`
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

    return h.redirect(fuelDescriptionHref)
  } catch (error) {
    logger.error(
      `[fuelDescriptionFuelAppearance] failed to save ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const fuelDescriptionFuelAppearanceController = {
  handler: handleFuelDescriptionFuelAppearanceRequest
}

export const fuelDescriptionFuelAppearanceSaveController = {
  handler: handleFuelDescriptionFuelAppearanceSaveRequest
}

export {
  handleFuelDescriptionFuelAppearanceRequest,
  handleFuelDescriptionFuelAppearanceSaveRequest
}
