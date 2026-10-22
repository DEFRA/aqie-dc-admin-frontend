import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { getFuelApplicationDetails } from './review-fuel-application-data.js'
import { buildFuelApplicationViewModel } from './review-fuel-application-rows.js'
import { reviewFuelApplicationContent } from './content.js'

const logger = createLogger()
const content = reviewFuelApplicationContent.en

async function handleReviewFuelApplicationRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getFuelApplicationDetails(applicationId)
    const application = response.data

    return h.view(
      'review-fuel-application/index',
      buildFuelApplicationViewModel(application, applicationId)
    )
  } catch (error) {
    logger.error(
      `[reviewFuelApplication] failed to load ${applicationId}: ${error.message}`
    )

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

export const reviewFuelApplicationController = {
  handler: handleReviewFuelApplicationRequest
}

export { handleReviewFuelApplicationRequest }
