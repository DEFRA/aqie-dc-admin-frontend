import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { getFuelApplicationDetails } from './fuel-application-details-data.js'
import { buildFuelApplicationViewModel } from './fuel-application-details-rows.js'
import { fuelApplicationDetailsContent } from './content.js'

const logger = createLogger()
const content = fuelApplicationDetailsContent.en

async function handleFuelApplicationDetailsRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getFuelApplicationDetails(applicationId)
    const application = response.data

    return h.view(
      'fuel-application-details/index',
      buildFuelApplicationViewModel(application, applicationId)
    )
  } catch (error) {
    logger.error(
      `[fuelApplicationDetails] failed to load ${applicationId}: ${error.message}`
    )

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

export const fuelApplicationDetailsController = {
  handler: handleFuelApplicationDetailsRequest
}

export { handleFuelApplicationDetailsRequest }
