import { finishApplicationReviewContent } from './content.js'
import { getApplicationWithTechStatus } from './application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

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

    // Render complete application page
    const heading = finishApplicationReviewContent.en.heading
    const pageTitle = finishApplicationReviewContent.en.pageTitle

    return h.view('finish-application-review/index', {
      pageTitle,
      heading,
      applicationId,
      application,
      containsBoth
    })
  } catch (error) {
    logger.error(
      `[finish-application-review.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

const finishApplicationReviewController = {
  handler: handleFinishApplicationReviewRequest
}

export {
  handleFinishApplicationReviewRequest,
  finishApplicationReviewController
}
