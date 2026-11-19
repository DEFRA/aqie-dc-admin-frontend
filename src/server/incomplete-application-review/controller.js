import {
  content,
  getIncompleteApplicationReviewPageContent
} from './content.js'
import { getApplicationWithTechStatus } from '../finish-application-review/application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleIncompleteApplicationReviewRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data
    const pageContent = getIncompleteApplicationReviewPageContent(
      application.type
    )

    return h.view('incomplete-application-review/index', {
      pageTitle: pageContent.pageTitle,
      heading: pageContent.heading,
      applicationId,
      introText: pageContent.introText,
      returnLinkText: pageContent.returnLinkText,
      returnLink: pageContent.getReturnLink(applicationId)
    })
  } catch (error) {
    logger.error(
      `[incomplete-application-review.GET] failed for ${applicationId}: ${error.message}`,
      error
    )

    return h
      .view('error/index', {
        message: content.en.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const incompleteApplicationReviewController = {
  handler: handleIncompleteApplicationReviewRequest
}

export {
  handleIncompleteApplicationReviewRequest,
  incompleteApplicationReviewController
}
