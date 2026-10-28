import { applianceApplicationDetailsContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  getApplianceDetail,
  getApplicationDetails
} from './appliance-application-details-data.js'
import {
  buildSummaryRows,
  buildLegacySummaryRows
} from './appliance-application-details-rows.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { formatApplicationId } from '../../../config/nunjucks/filters/format-application-id.js'

const logger = createLogger()
const content = applianceApplicationDetailsContent.en

function buildViewModel(appliance, application, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const title = application.id
    ? `Application ${formatApplicationId(application.id)} details`
    : 'Application details'
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: title,
    heading: title,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacySummaryRows(appliance, application)
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
