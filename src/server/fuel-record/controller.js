/**
 * Fuel Record Controller
 *
 * Fetches the normalised fuel record from the backend (GET /admin/fuels/{id}),
 * maps it to a view model and renders the fuel-record page.
 */
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelRecord } from './fuel-record-data.js'
import { buildFuelRecordViewModel } from './fuel-record-helpers.js'
import { fuelRecordContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelRecordContent.en

const renderError = (h, status) => {
  const notFound = status === statusCodes.notFound
  return h
    .view('error/index', {
      message: notFound ? content.errors.notFound : content.errors.generic
    })
    .code(notFound ? statusCodes.notFound : statusCodes.internalServerError)
}

export const handleGetFuelRecordPage = async (request, h) => {
  const { fuelId } = request.params

  try {
    const fuelRecord = await getFuelRecord(fuelId)

    if (!fuelRecord?.success) {
      logger.error(
        `[fuelRecord] Failed to load fuel record for ${fuelId}: ${fuelRecord?.message}`
      )
      return renderError(h)
    }

    return h.view(
      'fuel-record/index',
      buildFuelRecordViewModel(fuelId, fuelRecord.data)
    )
  } catch (error) {
    logger.error(
      `[fuelRecord] Failed to load fuel record for ${fuelId}: ${error.message}`
    )
    return renderError(h, error.status)
  }
}

export const fuelRecordController = {
  handler: handleGetFuelRecordPage
}
