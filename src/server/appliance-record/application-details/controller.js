import { applianceApplicationDetailsContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceTechnicalReview } from '../../common/services/common-appliance-service.js'
import { getApplicationDetails } from './appliance-application-details-data.js'
import {
  buildSummaryRows,
  buildLegacySummaryRows
} from './appliance-application-details-rows.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceApplicationDetailsContent.en

function buildViewModel(appliance, application, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const title = application.id
    ? `Application ${application.id} details`
    : 'Application details'
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: title,
    heading: title,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacySummaryRows(application)
      : buildSummaryRows(application),
    backLink: { href: returnHref },
    returnHref,
    returnToRecord,
    breadcrumbs
  }
}

async function handleApplianceApplicationDetailsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceTechnicalReview(applianceId)
    const applicationId = appliance.isLegacyRecord
      ? appliance.legacy?.applicationId
      : appliance.applicationId
    const application = applicationId
      ? (await getApplicationDetails(applicationId)).data
      : {}

    return h.view(
      'appliance-record/application-details/index',
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
