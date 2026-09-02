import { completeApplicationAppliancesContent } from './content.js'
import { getApplicationWithTechStatus } from './application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleCompleteApplicationAppliancesRequest(request, h) {
  const { applicationId } = request.params

  try {
    const applicationData = await getApplicationWithTechStatus(applicationId)

    // check groupedByTechReviewStatus.unreviewed if its empty or not
    const unreviewedArray =
      applicationData.groupedByTechReviewStatus?.unreviewed || []
    const hasPendingReviews = unreviewedArray.length > 0

    const heading = hasPendingReviews
      ? completeApplicationAppliancesContent.en.getHeading(applicationId)
      : completeApplicationAppliancesContent.en.reviewCompleteHeading
    const pageTitle = hasPendingReviews
      ? completeApplicationAppliancesContent.en.getPageTitle(applicationId)
      : completeApplicationAppliancesContent.en.reviewCompletePageTitle

    return h.view('complete-application-appliances/index', {
      pageTitle,
      heading,
      applicationId,
      applicationData,
      hasPendingReviews
    })
  } catch (error) {
    logger.error(
      `[complete-application-appliances.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

const completeApplicationAppliancesController = {
  handler: handleCompleteApplicationAppliancesRequest
}

export {
  handleCompleteApplicationAppliancesRequest,
  completeApplicationAppliancesController
}
