import {
  finishApplicationReviewContent,
  getFinishApplicationReviewPageContent
} from './content.js'
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
    const pageContent = getFinishApplicationReviewPageContent(application.type)
    const linkedItems = application.linkedItems || {}
    const acceptedItems = linkedItems.accepted || []
    const rejectedItems = linkedItems.rejected || []

    // If review not complete, redirect to incomplete application page
    if (!application.applicationReviewComplete) {
      return h.redirect(`/incomplete-application-review/${applicationId}`)
    }

    const containsBoth = rejectedItems.length > 0 && acceptedItems.length > 0

    return h.view('finish-application-review/index', {
      pageTitle: pageContent.pageTitle,
      heading: pageContent.heading,
      applicationId,
      application: {
        ...application,
        linkedItems: {
          accepted: acceptedItems,
          rejected: rejectedItems
        }
      },
      containsBoth,
      content: pageContent,
      returnLink: pageContent.returnLink(applicationId)
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
  const credentials = request.auth && request.auth.credentials
  const user = credentials && credentials.user

  if (!user || !user.name || !user.email) {
    logger.warn(
      `[finish-application-review.POST] missing reviewer name/email in auth credentials for ${applicationId}, falling back to unknown reviewer`
    )
  }

  const reviewedBy = {
    name: user && user.name ? user.name : 'Unknown reviewer',
    email: user && user.email ? user.email : 'unknown-reviewer@unknown.gov.uk'
  }

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
