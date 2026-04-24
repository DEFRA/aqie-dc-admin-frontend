import { applianceApplicationsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplications } from './applications-data.js'

const logger = createLogger()

async function handleApplianceApplicationsRequest(_request, h) {
  try {
    const { notStarted, inProgress } = await getApplianceApplications()

    return h.view('applications-appliances/index', {
      pageTitle: applianceApplicationsContent.en.heading,
      heading: applianceApplicationsContent.en.heading,
      content: applianceApplicationsContent.en,
      notStarted,
      inProgress,
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
    logger.error(`appliance applications get failed: ${error.message}`, error)
    return h.view('error/index', { message: '', details: error })
  }
}

const applianceApplicationsController = {
  handler: handleApplianceApplicationsRequest
}

export { handleApplianceApplicationsRequest, applianceApplicationsController }
