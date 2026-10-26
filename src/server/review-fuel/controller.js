import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { reviewFuelContent } from './content.js'
import { getFuelReview, saveFuelReview } from './review-fuel-data.js'
import { ReviewFuelViewModelBuilder } from './review-fuel-helpers.js'

const logger = createLogger()
const content = reviewFuelContent.en

const decisionStatus = {
  accept: 'accepted',
  reject: 'rejected'
}

/**
 * Handle the request/response concerns only.
 * The data shaping and view-model generation live in the helper class so the
 * route remains lightweight and easy to follow.
 */
async function handleReviewFuelRequest(request, h) {
  const { fuelId } = request.params

  try {
    const response = await getFuelReview(fuelId)
    const fuel = response.data

    return h.view(
      'review-fuel/index',
      ReviewFuelViewModelBuilder.buildViewModel(fuel, fuelId)
    )
  } catch (error) {
    logger.error(`[reviewFuel] failed to load ${fuelId}: ${error.message}`)

    const statusCode = error?.status || statusCodes.internalServerError

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCode)
  }
}

async function handleFuelDecisionRequest(request, h) {
  const { fuelId } = request.params
  const status = decisionStatus[request.payload.decision]
  const user = request.auth?.credentials?.user
  const reviewedBy =
    user?.name && user?.email
      ? { name: user.name, email: user.email }
      : undefined

  try {
    await saveFuelReview(fuelId, status, reviewedBy)

    const { data: fuel } = await getFuelReview(fuelId)

    return h.redirect(
      `/review-fuel-application/${encodeURIComponent(fuel.applicationId)}`
    )
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      logger.warn(
        `[reviewFuel] accept refused for ${fuelId}: checks outstanding`
      )

      return h.redirect(
        `/review-fuel/${encodeURIComponent(fuelId)}/incomplete-review`
      )
    }

    logger.error(
      `[reviewFuel] failed to save decision for ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const reviewFuelController = {
  handler: handleReviewFuelRequest
}

export const fuelDecisionController = {
  handler: handleFuelDecisionRequest
}

export { handleReviewFuelRequest, handleFuelDecisionRequest }
