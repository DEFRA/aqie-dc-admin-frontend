import { fuelAppearanceContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  getFuelAppearance,
  saveFuelAppearance
} from './fuel-appearance-data.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelAppearanceContent.en

function getReturnPage(returnTo) {
  return returnTo === 'fuel-description' ? 'fuel-description' : 'fuel-details'
}

function renderPage(h, fuelId, formValue, error, returnTo) {
  const encoded = encodeURIComponent(fuelId)
  const returnPage = getReturnPage(returnTo)
  const fuelDetailsHref = `/review-fuel/${encoded}/${returnPage}`
  const fuelAppearanceAction =
    returnTo === 'fuel-description'
      ? `/fuel-appearance/${encoded}?returnTo=fuel-description`
      : `/fuel-appearance/${encoded}`

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
  const { returnTo } = request.query

  try {
    const { data: fuel } = await getFuelAppearance(fuelId)

    return renderPage(
      h,
      fuelId,
      fuel.fuelDescription.appearance ?? '',
      null,
      returnTo
    )
  } catch (error) {
    logger.error(`[fuelAppearance] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelAppearanceSaveRequest(request, h) {
  const { fuelId } = request.params
  const { returnTo } = request.query
  const returnHref = `/review-fuel/${encodeURIComponent(fuelId)}/${getReturnPage(returnTo)}`
  const appearance = request.payload.appearance ?? ''
  const trimmed = appearance.trim()

  try {
    if (!trimmed) {
      return renderPage(
        h,
        fuelId,
        appearance,
        {
          field: 'appearance',
          message: content.errors.appearanceRequired,
          href: '#appearance'
        },
        returnTo
      ).code(statusCodes.badRequest)
    }

    await saveFuelAppearance(fuelId, trimmed)

    return h.redirect(returnHref)
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
