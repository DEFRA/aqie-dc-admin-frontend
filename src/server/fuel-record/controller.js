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

const renderNotFound = (h) =>
  h
    .view('error/index', { message: content.errors.notFound })
    .code(statusCodes.notFound)

const renderServiceError = (h) =>
  h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)

/**
 * Backend contract (see fuel-record-data.js): fetchJson throws on non-2xx with
 * `error.status`, otherwise resolves `{ success, data }` or `{ success: false, notFound }`.
 * 404 -> not found page (404); anything else -> generic error page (500).
 */
export const handleGetFuelRecordPage = async (request, h) => {
  const { fuelId } = request.params

  try {
    const fuelRecord = await getFuelRecord(fuelId)

    if (!fuelRecord.success) {
      if (fuelRecord.notFound) {
        logger.warn(`[fuelRecord] Fuel record not found: ${fuelId}`)
        return renderNotFound(h)
      }
      logger.error(
        `[fuelRecord] Failed to load fuel record for ${fuelId}: ${fuelRecord.message}`
      )
      return renderServiceError(h)
    }

    return h.view(
      'fuel-record/index',
      buildFuelRecordViewModel(fuelRecord.data)
    )
  } catch (error) {
    if (error.status === statusCodes.notFound) {
      logger.warn(`[fuelRecord] Fuel record not found: ${fuelId}`)
      return renderNotFound(h)
    }
    logger.error(
      `[fuelRecord] Failed to load fuel record for ${fuelId} (status ${error.status ?? 'n/a'}): ${error.message}`
    )
    return renderServiceError(h)
  }
}

export const fuelRecordController = {
  handler: handleGetFuelRecordPage
}
