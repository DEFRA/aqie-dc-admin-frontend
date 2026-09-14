import { finishApplicationReviewContent } from './content.js'
import {
  completeApplication,
  getApplicationWithTechStatus
} from './application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = finishApplicationReviewContent.en

async function handleFinishApplicationReviewRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data

    // If review not complete, redirect to incomplete application page
    if (!application.applicationReviewComplete) {
      return h.redirect(`/incomplete-application-review/${applicationId}`)
    }
    //screen to display both accepted and rejected
    const containsBoth =
      application.linkedItems?.rejected?.length > 0 &&
      application.linkedItems?.accepted?.length > 0

    return h.view('finish-application-review/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      applicationId,
      application,
      containsBoth,
      content,
      returnLink: content.returnLink(applicationId)
    })
  } catch (error) {
    logger.error(
      `[finish-application-review.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const finishApplicationReviewController = {
  handler: handleFinishApplicationReviewRequest
}

async function handleFinishApplicationReviewSubmitRequest(request, h) {
  const { applicationId } = request.params
  const user = request.auth?.credentials?.user
  const reviewedBy =
    user?.name && user?.email
      ? { name: user.name, email: user.email }
      : undefined

  try {
    await completeApplication(applicationId, reviewedBy)

    return h.redirect(`/application-review-complete/${applicationId}`)
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      logger.warn(
        `[finish-application-review.POST] complete refused for ${applicationId}: review incomplete`
      )
      return h.redirect(`/incomplete-application-review/${applicationId}`)
    }

    logger.error(
      `[finish-application-review.POST] failed to complete ${applicationId}: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const finishApplicationReviewSubmitController = {
  handler: handleFinishApplicationReviewSubmitRequest
}

export {
  handleFinishApplicationReviewRequest,
  handleFinishApplicationReviewSubmitRequest,
  finishApplicationReviewController,
  finishApplicationReviewSubmitController
}
