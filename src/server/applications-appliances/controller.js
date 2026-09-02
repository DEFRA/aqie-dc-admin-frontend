import { applianceApplicationsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplications } from './applications-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleApplianceApplicationsRequest(_request, h) {
  try {
    const response = await getApplianceApplications()
    const applications = response.data

    return h.view('applications-appliances/index', {
      pageTitle: applianceApplicationsContent.en.heading,
      heading: applianceApplicationsContent.en.heading,
      content: applianceApplicationsContent.en,
      notStartedApplications: applications.new,
      inProgressApplications: applications.inProgress,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/dashboard'
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
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

const applianceApplicationsController = {
  handler: handleApplianceApplicationsRequest
}

export { handleApplianceApplicationsRequest, applianceApplicationsController }
