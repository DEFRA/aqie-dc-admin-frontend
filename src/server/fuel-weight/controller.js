import { fuelWeightContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelWeight, saveFuelWeight } from './fuel-weight-data.js'
import { getFuelDescriptionFieldReturnHref } from '../common/helpers/fuel-description-field-return-href.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelWeightContent.en

function renderPage(h, fuelId, returnHref, formValue, error) {
  return h.view('fuel-weight/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: returnHref,
    fuelWeightAction: `/review-fuel/${encodeURIComponent(fuelId)}/fuel-weight`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

async function handleFuelWeightRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelWeight(fuelId)
    // fuelDescription can be missing or have no weight on first entry
    const { weight } = fuel.fuelDescription || {}

    return renderPage(
      h,
      fuelId,
      getFuelDescriptionFieldReturnHref(fuel, fuelId),
      weight || '',
      null
    )
  } catch (error) {
    logger.error(`[fuelWeight] failed to load ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

async function handleFuelWeightSaveRequest(request, h) {
  const { fuelId } = request.params
  const weight = request.payload.weight || ''
  const trimmed = weight.trim()

  try {
    const { data: fuel } = await getFuelWeight(fuelId)
    const returnHref = getFuelDescriptionFieldReturnHref(fuel, fuelId)

    if (!trimmed) {
      return renderPage(h, fuelId, returnHref, weight, {
        field: 'weight',
        message: content.errors.weightRequired,
        href: '#weight'
      }).code(statusCodes.badRequest)
    }

    await saveFuelWeight(fuelId, trimmed)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(`[fuelWeight] failed to save ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

export const fuelWeightController = {
  handler: handleFuelWeightRequest
}

export const fuelWeightSaveController = {
  handler: handleFuelWeightSaveRequest
}

export { handleFuelWeightRequest, handleFuelWeightSaveRequest }
