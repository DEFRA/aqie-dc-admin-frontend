import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { reviewFuelContent } from './content.js'
import { getFuelReview } from './review-fuel-data.js'
import { ReviewFuelViewModelBuilder } from './review-fuel-helpers.js'

const logger = createLogger()
const content = reviewFuelContent.en

async function handleIncompleteReviewRequest(request, h) {
  const { fuelId } = request.params

  try {
    const response = await getFuelReview(fuelId)
    const fuel = response.data

    return h.view(
      'review-fuel/incomplete-review',
      ReviewFuelViewModelBuilder.buildIncompleteReviewViewModel(fuel, fuelId)
    )
  } catch (error) {
    logger.error(
      `[incompleteReview] failed to load ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(error?.status || statusCodes.internalServerError)
  }
}

export const incompleteReviewController = {
  handler: handleIncompleteReviewRequest
}

export { handleIncompleteReviewRequest }
