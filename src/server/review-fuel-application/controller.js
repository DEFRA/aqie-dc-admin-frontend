import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getFuelApplicationDetails,
  startFuelApplicationReview
} from './review-fuel-application-data.js'
import { buildFuelApplicationViewModel } from './review-fuel-application-rows.js'
import { reviewFuelApplicationContent } from './content.js'

const logger = createLogger()
const content = reviewFuelApplicationContent.en

async function handleReviewFuelApplicationRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getFuelApplicationDetails(applicationId)
    const application = response.data

    if (!application?.linkedItems || application.linkedItems.length === 0) {
      return h
        .view('error/index', {
          message: content.errors.generic
        })
        .code(statusCodes.internalServerError)
    }

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

async function handleStartFuelApplicationReviewRequest(request, h) {
  const { applicationId } = request.params
  const user = request.auth?.credentials?.user

  let reviewedBy

  if (user?.name && user?.email) {
    reviewedBy = { name: user.name, email: user.email }
  } else {
    logger.warn(
      `[reviewFuelApplication] missing reviewer name/email for ${applicationId}, falling back to unknown reviewer`
    )
    reviewedBy = {
      name: user?.name ?? 'Unknown reviewer',
      email: user?.email ?? 'unknown-reviewer@unknown.gov.uk'
    }
  }

  try {
    await startFuelApplicationReview(applicationId, reviewedBy)

    return h.redirect(
      `/review-fuel-application/${encodeURIComponent(applicationId)}`
    )
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      return h.redirect(
        `/review-fuel-application/${encodeURIComponent(applicationId)}`
      )
    }

    logger.error(
      `[reviewFuelApplication] failed to start review for ${applicationId}: ${error.message}`
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

export const startReviewFuelApplicationController = {
  handler: handleStartFuelApplicationReviewRequest
}

export {
  handleReviewFuelApplicationRequest,
  handleStartFuelApplicationReviewRequest
}
