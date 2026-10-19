import { applianceRecordInstructionManualContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceForInstructionManual } from './appliance-record-instruction-manual-data.js'
import {
  buildInstructionManualRows,
  buildServicingManualRows
} from './appliance-record-instruction-manual-rows.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceRecordInstructionManualContent.en

function buildViewModel(appliance, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const isLegacyRecord = appliance.isLegacyRecord === true
  const headingPrefix = isLegacyRecord
    ? content.legacyHeadingPrefix
    : content.headingPrefix
  const heading = `${headingPrefix} ${appliance.modelName}`

  return {
    pageTitle: heading,
    heading,
    isLegacyRecord,
    sections: content.sections,
    instructionManualRows: buildInstructionManualRows(appliance),
    servicingManualRows: isLegacyRecord
      ? buildServicingManualRows(appliance)
      : [],
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      { text: 'Appliance records', href: '/appliance-records' },
      { text: appliance.modelName, href: returnHref }
    ]
  }
}

async function handleApplianceRecordInstructionManualRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } =
      await getApplianceForInstructionManual(applianceId)

    return h.view(
      'appliance-record-instruction-manual/index',
      buildViewModel(appliance, applianceId)
    )
  } catch (error) {
    logger.error(
      `[applianceRecordInstructionManual] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const applianceRecordInstructionManualController = {
  handler: handleApplianceRecordInstructionManualRequest
}

export { handleApplianceRecordInstructionManualRequest }
