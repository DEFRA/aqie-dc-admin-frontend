import { fuelDetailsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelDetails,
  markFuelDetailsCompleted
} from './fuel-details-data.js'
import {
  buildManufacturerFuelDetailsRows,
  buildRebranderFuelDetailsRows
} from './fuel-details-rows.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelDetailsContent.en

function buildViewModel(fuel, fuelId) {
  const isRebrander = fuel.supplierType === 'Rebrand'
  const displayName = fuel.name ?? content.notProvided
  const returnHref = `/review-fuel/${encodeURIComponent(fuelId)}`

  return {
    pageTitle: content.pageTitle(displayName),
    heading: content.heading(displayName),
    summaryRows: isRebrander
      ? buildRebranderFuelDetailsRows(fuel, fuelId)
      : buildManufacturerFuelDetailsRows(fuel, fuelId),
    fuelDetailsAction: `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`,
    cancelHref: returnHref,
    isAlreadyComplete: false
  }
}

async function handleFuelDetailsRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelDetails(fuelId)

    return h.view('fuel-details/index', buildViewModel(fuel, fuelId))
  } catch (error) {
    logger.error(`[fuelDetails] failed to load ${fuelId}: ${error.message}`)
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelDetailsMarkCompleteRequest(request, h) {
  const { fuelId } = request.params

  try {
    await markFuelDetailsCompleted(fuelId)

    return h.redirect(`/review-fuel/${encodeURIComponent(fuelId)}`)
  } catch (error) {
    logger.error(
      `[fuelDetails] failed to mark complete ${fuelId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const fuelDetailsController = {
  handler: handleFuelDetailsRequest
}

export const fuelDetailsMarkCompleteController = {
  handler: handleFuelDetailsMarkCompleteRequest
}

export { handleFuelDetailsRequest, handleFuelDetailsMarkCompleteRequest }
