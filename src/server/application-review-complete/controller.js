import {
  applicationReviewCompleteContent,
  getApplicationReviewCompletePageContent
} from './content.js'
import { getApplicationWithTechStatus } from '../finish-application-review/application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleApplicationReviewCompleteRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data
    const content = getApplicationReviewCompletePageContent(application.type)

    return h.view('application-review-complete/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      applicationId,
      description: content.description(applicationId),
      content
    })
  } catch (error) {
    logger.error(
      `[application-review-complete.GET] failed for ${applicationId}: ${error.message}`,
      error
    )

    return h
      .view('error/index', {
        message: applicationReviewCompleteContent.en.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const applicationReviewCompleteController = {
  handler: handleApplicationReviewCompleteRequest
}

export {
  handleApplicationReviewCompleteRequest,
  applicationReviewCompleteController
}
