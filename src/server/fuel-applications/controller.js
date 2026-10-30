import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { fuelApplicationsContent } from './content.js'
import { getFuelApplications } from './fuel-applications-data.js'
import { buildFuelApplicationsViewModel } from './fuel-applications-helpers.js'

const logger = createLogger()
const content = fuelApplicationsContent.en

/**
 * Logs a failed fuel applications list request with route and operation context.
 * @param {Error} [error] - The caught exception from the data layer.
 */
function logFuelApplicationsError(error) {
  logger.error('[fuel-applications.GET] failed', {
    route: '/fuel-applications',
    operation: 'getFuelApplications',
    message: error?.message ?? 'Unknown error',
    stack: error?.stack
  })
}

/**
 * Renders the list page for fuel applications that are awaiting review or
 * already in progress.
 * @param {object} _request - The incoming Hapi request.
 * @param {object} h - The Hapi response toolkit.
 * @returns {Promise<object>} The rendered fuel applications page or error view.
 */
async function handleFuelApplicationsRequest(_request, h) {
  try {
    const response = await getFuelApplications()
    const applications = response.data

    return h.view(
      'fuel-applications/index',
      buildFuelApplicationsViewModel(applications)
    )
  } catch (error) {
    logFuelApplicationsError(error)

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const fuelApplicationsController = {
  handler: handleFuelApplicationsRequest
}

export { handleFuelApplicationsRequest, fuelApplicationsController }
