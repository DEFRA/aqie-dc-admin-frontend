import { content } from './content.js'
import { getApplicationWithTechStatus } from '../finish-application-review/application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleIncompleteApplicationReviewRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data

    const heading = content.en.getHeading(applicationId)
    const pageTitle = content.en.getPageTitle(applicationId)

    return h.view('incomplete-application-review/index', {
      pageTitle,
      heading,
      applicationId,
      application
    })
  } catch (error) {
    logger.error(
      `[incomplete-application-review.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
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
