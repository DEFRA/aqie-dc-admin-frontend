import { fuelDetailsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelDetails } from './fuel-details-data.js'
import {
  buildManufacturerFuelDetailsRows,
  buildResellerFuelDetailsRows
} from './fuel-details-rows.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelDetailsContent.en

function buildViewModel(fuel, fuelId) {
  const isReseller = fuel.manufacturerOrReseller === 'reseller'
  const displayName = isReseller
    ? (fuel.rebrandedName ?? content.notProvided)
    : (fuel.brandName ?? content.notProvided)
  const returnHref = fuel.applicationId
    ? `/review-fuel-application/${encodeURIComponent(fuel.applicationId)}`
    : '/fuel-applications'

  return {
    pageTitle: content.pageTitle(displayName),
    heading: content.heading(displayName),
    summaryRows: isReseller
      ? buildResellerFuelDetailsRows(fuel, fuelId)
      : buildManufacturerFuelDetailsRows(fuel, fuelId),
    markAsCompletedHref: returnHref,
    cancelHref: returnHref
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

export const fuelDetailsController = {
  handler: handleFuelDetailsRequest
}

export { handleFuelDetailsRequest }
