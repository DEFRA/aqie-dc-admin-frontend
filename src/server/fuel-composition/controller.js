import { fuelCompositionContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelComposition,
  saveFuelComposition
} from './fuel-composition-data.js'
import { getFuelDescriptionFieldReturnHref } from '../common/helpers/fuel-description-field-return-href.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelCompositionContent.en

function renderPage(h, fuelId, returnHref, formValue, error) {
  return h.view('fuel-composition/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: returnHref,
    fuelCompositionAction: `/review-fuel/${encodeURIComponent(fuelId)}/fuel-composition`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

async function handleFuelCompositionRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelComposition(fuelId)
    // fuelDescription can be missing or have no composition on first entry
    const { composition } = fuel.fuelDescription || {}

    return renderPage(
      h,
      fuelId,
      getFuelDescriptionFieldReturnHref(fuel, fuelId),
      composition ?? '',
      null
    )
  } catch (error) {
    logger.error(`[fuelComposition] failed to load ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

async function handleFuelCompositionSaveRequest(request, h) {
  const { fuelId } = request.params
  const composition = request.payload.composition ?? ''
  const trimmed = composition.trim()

  try {
    const { data: fuel } = await getFuelComposition(fuelId)
    const returnHref = getFuelDescriptionFieldReturnHref(fuel, fuelId)

    if (!trimmed) {
      return renderPage(h, fuelId, returnHref, composition, {
        field: 'composition',
        message: content.errors.compositionRequired,
        href: '#composition'
      }).code(statusCodes.badRequest)
    }

    await saveFuelComposition(fuelId, trimmed)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(`[fuelComposition] failed to save ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

export const fuelCompositionController = {
  handler: handleFuelCompositionRequest
}

export const fuelCompositionSaveController = {
  handler: handleFuelCompositionSaveRequest
}

export { handleFuelCompositionRequest, handleFuelCompositionSaveRequest }
