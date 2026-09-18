import { technicalDrawingsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getAppliance,
  saveTechnicalDrawings
} from './technical-drawings-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = technicalDrawingsContent.en

async function handleTechnicalDrawingsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getAppliance(applianceId)

    return h.view('technical-drawings/index', {
      pageTitle: `${content.title} for ${appliance.modelName}`,
      heading: `${content.title} for ${appliance.modelName}`,
      content,
      appliance,
      reviewHref: `/review-appliance/${encodeURIComponent(applianceId)}`
    })
  } catch (error) {
    logger.error(
      `[technicalDrawings] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleTechnicalDrawingsDecisionRequest(request, h) {
  const { applianceId } = request.params
  const reviewHref = `/review-appliance/${encodeURIComponent(applianceId)}`

  try {
    await saveTechnicalDrawings(
      applianceId,
      request.payload.decision === 'pass'
    )

    return h.redirect(reviewHref)
  } catch (error) {
    logger.error(
      `[technicalDrawings] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const technicalDrawingsController = { handler: handleTechnicalDrawingsRequest }
const technicalDrawingsDecisionController = {
  handler: handleTechnicalDrawingsDecisionRequest
}

export {
  handleTechnicalDrawingsRequest,
  handleTechnicalDrawingsDecisionRequest,
  technicalDrawingsController,
  technicalDrawingsDecisionController
}
