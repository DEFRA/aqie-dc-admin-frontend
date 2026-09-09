import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview } from '../review-appliance/appliance-data.js'
import { conformityContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { saveConformityMarkResult } from './conformity-mark-data.js'

const logger = createLogger()
const content = conformityContent.en

function buildReviewHref(applianceId) {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

function renderServiceError(h) {
  return h
    .view('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    .code(statusCodes.internalServerError)
}

/**
 * Loads the conformity-mark review page for a single appliance.
 */
async function loadConformityMarkPage(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceReview(applianceId)

    return h.view('conformity-mark/index', {
      pageTitle: content.heading(appliance.modelName),
      heading: content.heading(appliance.modelName),
      intro: content.intro,
      appliance,
      reviewHref: buildReviewHref(applianceId)
    })
  } catch (error) {
    logger.error(
      `[reviewConformity] failed to load ${applianceId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

/**
 * Saves the pass/fail result for the conformity-mark review and returns to the review screen.
 */
async function submitConformityMarkDecision(request, h) {
  const { applianceId } = request.params
  const pass = request.payload.decision === 'pass'

  try {
    await saveConformityMarkResult(applianceId, pass)

    return h.redirect(
      `${buildReviewHref(applianceId)}?confstatusCS=${pass ? 'pass' : 'fail'}`
    )
  } catch (error) {
    logger.error(
      `[reviewConformity] failed to save ${applianceId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

export const conformityMarkController = {
  get: loadConformityMarkPage,
  post: submitConformityMarkDecision
}
