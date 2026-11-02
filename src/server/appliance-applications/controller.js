import { applianceApplicationsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplications } from './applications-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

function toReviewRows(list) {
  return (list ?? []).map((application) => ({
    ...application,
    reviewHref: `/review-appliance-application/${encodeURIComponent(application.id)}`
  }))
}

async function handleApplianceApplicationsRequest(_request, h) {
  try {
    const response = await getApplianceApplications()
    const applications = response.data

    return h.view('appliance-applications/index', {
      pageTitle: applianceApplicationsContent.en.heading,
      heading: applianceApplicationsContent.en.heading,
      content: applianceApplicationsContent.en,
      notStartedApplications: toReviewRows(applications.new),
      inProgressApplications: toReviewRows(applications.inProgress),
      breadcrumbs: [
        {
          text: 'Home',
          href: '/manage-certification'
        },
        {
          text: applianceApplicationsContent.en.heading
        }
      ]
    })
  } catch (error) {
    logger.error(
      `[applications-appliances.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: applianceApplicationsContent.en.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const applianceApplicationsController = {
  handler: handleApplianceApplicationsRequest
}

export { handleApplianceApplicationsRequest, applianceApplicationsController }
