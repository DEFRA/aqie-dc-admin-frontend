import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview } from '../review-appliance/appliance-data.js'
import { conformityContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { saveConformityMarkResult } from './conformity-mark-data.js'

const logger = createLogger()
const content = conformityContent.en
const checkResult = {
  pass: true,
  fail: false
}

function buildReviewHref(applianceId) {
  return `/review-appliance/${encodeURIComponent(applianceId)}`
}

function resolveCheckResult(decision) {
  const result = checkResult[decision]

  if (typeof result !== 'boolean') {
    throw new Error(`Invalid conformity-mark decision: ${String(decision)}`)
  }

  return result
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
      passButtonText: content.markPassed,
      failButtonText: content.markFailed,
      cancelText: content.cancel,
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

  try {
    const pass = resolveCheckResult(request.payload.decision)
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
