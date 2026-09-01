import { completeApplicationAppliancesContent } from './content.js'
import { getApplicationWithTechStatus } from './application-data.js'

async function handleCompleteApplicationAppliancesRequest(request, h) {
  const { applicationId } = request.params

  const applicationData = await getApplicationWithTechStatus(applicationId)

  //check groupedByTechReviewStatus.unreviewed if its empty or not
  const unreviewedArray =
    applicationData.groupedByTechReviewStatus?.unreviewed || []
  const hasPendingReviews = unreviewedArray.length > 0
  const heading =
    completeApplicationAppliancesContent.en.getHeading(applicationId)
  const pageTitle =
    completeApplicationAppliancesContent.en.getPageTitle(applicationId)

  return h.view('complete-application-appliances/index', {
    pageTitle,
    heading,
    applicationId,
    applicationData,
    hasPendingReviews
  })
}

const completeApplicationAppliancesController = {
  handler: handleCompleteApplicationAppliancesRequest
}

export {
  handleCompleteApplicationAppliancesRequest,
  completeApplicationAppliancesController
}
