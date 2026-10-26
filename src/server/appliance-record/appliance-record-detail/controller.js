import { applianceRecordDetailContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceDetail } from './appliance-record-detail-data.js'
import {
  buildLegacyRows,
  buildNonLegacyRows
} from './appliance-record-detail-rows.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceRecordDetailContent.en

function buildViewModel(appliance, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: content.pageTitle,
    heading: content.heading,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacyRows(appliance)
      : buildNonLegacyRows(appliance),
    backLink: { href: returnHref },
    returnHref,
    returnToRecord,
    breadcrumbs
  }
}

async function handleApplianceRecordDetailRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceDetail(applianceId)

    return h.view(
      'appliance-record/appliance-record-detail/index',
      buildViewModel(appliance, applianceId)
    )
  } catch (error) {
    logger.error(
      `[applianceRecordDetail] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const applianceRecordDetailController = {
  handler: handleApplianceRecordDetailRequest
}

export { handleApplianceRecordDetailRequest }
