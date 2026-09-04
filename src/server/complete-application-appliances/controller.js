import { completeApplicationAppliancesContent } from './content.js'
import { getApplicationWithTechStatus } from './application-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleCompleteApplicationAppliancesRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data

    // check appliances.unreviewed if its empty or not
    const unreviewedArray = application.appliances?.unreviewed || []
    const hasPendingReviews = unreviewedArray.length > 0

    // If pending reviews, redirect to incomplete application page
    if (hasPendingReviews) {
      return h.redirect(`/application-review-incomplete/${applicationId}`)
    }
    //screen to display both accepted and rejected
    const containsBoth =
      application.appliances?.rejected?.length > 0 &&
      application.appliances?.accepted?.length > 0

    // Render complete application page
    const heading =
      completeApplicationAppliancesContent.en.applicationCompleteHeading
    const pageTitle =
      completeApplicationAppliancesContent.en.applicationCompletePageTitle

    return h.view('complete-application-appliances/index', {
      pageTitle,
      heading,
      applicationId,
      application,
      hasPendingReviews: false,
      containsBoth
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

async function handleIncompleteApplicationAppliances(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplicationWithTechStatus(applicationId)
    const application = response.data

    const heading =
      completeApplicationAppliancesContent.en.getHeading(applicationId)
    const pageTitle =
      completeApplicationAppliancesContent.en.getPageTitle(applicationId)

    return h.view('complete-application-appliances/index', {
      pageTitle,
      heading,
      applicationId,
      application,
      hasPendingReviews: true
    })
  } catch (error) {
    logger.error(
      `[incomplete-application-appliances.GET] failed: ${error.message}`,
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

const incompleteApplicationAppliancesController = {
  handler: handleIncompleteApplicationAppliances
}

export {
  handleCompleteApplicationAppliancesRequest,
  completeApplicationAppliancesController,
  handleIncompleteApplicationAppliances,
  incompleteApplicationAppliancesController
}
