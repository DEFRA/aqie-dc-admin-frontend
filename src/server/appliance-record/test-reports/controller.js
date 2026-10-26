import { testReportsContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getTestReports } from './test-reports-data.js'
import { buildTestResultsRows } from './test-reports-rows.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = testReportsContent.en

function buildViewModel(appliance, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: `${content.headingPrefix} ${appliance.modelName}`,
    heading: `${content.headingPrefix} ${appliance.modelName}`,
    summaryRows: buildTestResultsRows(appliance),
    backLink: { href: returnHref },
    returnHref,
    returnToRecord,
    breadcrumbs
  }
}

async function handleTestReportsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getTestReports(applianceId)

    return h.view(
      'appliance-record/test-reports/index',
      buildViewModel(appliance, applianceId)
    )
  } catch (error) {
    logger.error(
      `[testReports] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const applianceRecordTestReportsController = {
  handler: handleTestReportsRequest
}

export { handleTestReportsRequest }
