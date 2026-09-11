import { appliancesApplicationContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplication } from './application-data.js'
//updateApplianceApplicationStatus
import { statusCodes } from '../common/constants/status-codes.js'
import { applianceApplicationsContent } from '../appliance-applications/content.js'

const logger = createLogger()
const content = appliancesApplicationContent.en

/**
 * Splits the full address string into trimmed, non-empty lines, falling
 * back to the structured address parts when no full address is available.
 */
function buildCompanyAddress(application) {
  if (application.companyFullAddress) {
    return application.companyFullAddress
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return [
    application.companyAddress.line1,
    application.companyAddress.line2,
    application.companyAddress.city,
    application.companyAddress.county,
    application.companyAddress.postcode,
    application.companyAddress.country
  ].filter(Boolean)
}

/**
 * Maps each linked appliance to the row shown in the appliances table,
 * including its status tag and review action link.
 */
function buildApplianceRows(linkedItems) {
  return linkedItems.map((appliance) => {
    const status = appliance.technicalReview?.status ?? 'new'
    const tag = content.statusTags[status]

    return {
      modelName: appliance.modelName,
      tag,
      actionHref: `/review-appliance/${appliance.id}`,
      actionText: tag.text
    }
  })
}

function buildViewModel(application, applicationId) {
  return {
    pageTitle: content.heading,
    heading: content.heading,
    applicationId,
    application,
    appliances: buildApplianceRows(application.linkedItems),
    companyAddress: buildCompanyAddress(application),
    finishReviewLink: content.finishReviewLink(applicationId),
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      {
        text: applianceApplicationsContent.en.heading,
        href: '/appliance-applications'
      },
      { text: content.heading }
    ]
  }
}

async function handleAppliancesApplicationRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplianceApplication(applicationId)
    const application = response.data

    return h.view(
      'review-appliance-application/index',
      buildViewModel(application, applicationId)
    )
  } catch (error) {
    logger.error(
      `[reviewApplicationAppliances] failed to load ${applicationId}: ${error.message}`
    )
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

const appliancesApplicationController = {
  handler: handleAppliancesApplicationRequest
}

export { handleAppliancesApplicationRequest, appliancesApplicationController }
