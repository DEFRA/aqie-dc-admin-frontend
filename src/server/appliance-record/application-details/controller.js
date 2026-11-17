import { applianceApplicationDetailsContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  getApplianceDetail,
  getApplicationDetails
} from './application-details-data.js'
import {
  buildSummaryRows,
  buildLegacySummaryRows
} from './application-details-rows.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { formatApplicationId } from '../../../config/nunjucks/filters/format-application-id.js'

const logger = createLogger()
const content = applianceApplicationDetailsContent.en

function buildViewModel(appliance, application, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const displayId = appliance.isLegacyRecord
    ? appliance.legacy?.applicationId
    : application.id
  const title = displayId
    ? `Application ${formatApplicationId(displayId)} details`
    : 'Application details'
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: title,
    heading: title,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacySummaryRows(appliance)
      : buildSummaryRows(appliance, application),
    backLink: { href: returnHref },
    returnHref,
    returnToRecord,
    breadcrumbs
  }
}

async function handleApplianceApplicationDetailsRequest(request, h) {
  const { applianceId } = request.params

  try {
    // Backend contract: /appliances/{ID} supplies company and contact details;
    // /applications/{id} supplies submittedAt and linkedItems only.
    const { data: appliance } = await getApplianceDetail(applianceId)
    // Legacy records have no document in /applications: legacy.applicationId
    // is a legacy reference (e.g. CAA-EA-00001720), so everything shown comes
    // from the appliance record itself.
    const applicationId = appliance.isLegacyRecord
      ? undefined
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
