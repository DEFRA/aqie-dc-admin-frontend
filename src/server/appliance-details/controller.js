import { checkApplianceDetailsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForCheckDetails,
  markApplianceDetailsCompleted
} from './appliance-details-data.js'
import { buildSummaryItems } from './appliance-summary-builder.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = checkApplianceDetailsContent.en

async function handleCheckApplianceDetailsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForCheckDetails(applianceId)

    return h.view('appliance-details/index', {
      pageTitle: content.heading(appliance.modelName),
      heading: content.heading(appliance.modelName),
      content,
      appliance,
      summaryItems: buildSummaryItems(appliance),
      reviewHref: `/review-appliance/${encodeURIComponent(applianceId)}`
    })
  } catch (error) {
    logger.error(
      `[checkApplianceDetails] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleMarkCheckApplianceDetailsRequest(request, h) {
  const { applianceId } = request.params

  try {
    await markApplianceDetailsCompleted(applianceId)

    return h.redirect(`/review-appliance/${encodeURIComponent(applianceId)}`)
  } catch (error) {
    logger.error(
      `[checkApplianceDetails] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const checkApplianceDetailsController = {
  handler: handleCheckApplianceDetailsRequest
}

const markCheckApplianceDetailsController = {
  handler: handleMarkCheckApplianceDetailsRequest
}

export {
  handleCheckApplianceDetailsRequest,
  handleMarkCheckApplianceDetailsRequest,
  checkApplianceDetailsController,
  markCheckApplianceDetailsController
}
