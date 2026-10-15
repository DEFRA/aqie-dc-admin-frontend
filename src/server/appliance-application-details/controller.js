import { applianceApplicationDetailsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceTechnicalReview } from '../common/services/common-appliance-service.js'
import { getApplicationDetails } from './appliance-application-details-data.js'
import {
  buildSummaryRows,
  buildLegacySummaryRows
} from './appliance-application-details-rows.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceApplicationDetailsContent.en

function buildViewModel(appliance, application, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`

  return {
    pageTitle: `Application ${application.id} details`,
    heading: `Application ${application.id} details`,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacySummaryRows(application)
      : buildSummaryRows(application),
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      { text: 'Appliance records', href: '/appliance-records' },
      { text: appliance.modelName, href: returnHref }
    ]
  }
}

async function handleApplianceApplicationDetailsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceTechnicalReview(applianceId)
    const { data: application } = await getApplicationDetails(
      appliance.applicationId
    )

    return h.view(
      'appliance-application-details/index',
      buildViewModel(appliance, application, applianceId)
    )
  } catch (error) {
    logger.error(
      `[applianceApplicationDetails] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const applianceApplicationDetailsController = {
  handler: handleApplianceApplicationDetailsRequest
}

export { handleApplianceApplicationDetailsRequest }
