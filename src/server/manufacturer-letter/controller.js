import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuel } from './manufacturer-letter-data.js'
import { manufacturerLetterContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { saveManufacturerLetterResult } from './manufacturer-letter-data.js'

const logger = createLogger()
const content = manufacturerLetterContent.en
const checkResult = {
  pass: true,
  fail: false
}

function buildReviewHref(fuelId) {
  return `/review-fuel/${encodeURIComponent(fuelId)}`
}

function renderServiceError(h, message = content.errors.generic) {
  return h
    .view('error/index', { message })
    .code(statusCodes.internalServerError)
}

/**
 * Loads the manufacturer-letter review page for a single fuel.
 * The fuelId is passed via query string parameter.
 * Only allows Rebrand fuels; Manufacture fuels are rejected.
 */
async function loadManufacturerLetterPage(request, h) {
  const { fuelId } = request.query

  if (!fuelId) {
    logger.error('[manufacturerLetter] missing fuelId in query string')
    return renderServiceError(h)
  }

  try {
    const { data: fuel } = await getFuel(fuelId)

    if (fuel.supplierType !== 'Rebrand') {
      logger.warn(
        `[manufacturerLetter] attempted to review non-Rebrand fuel ${fuelId}: ${fuel.supplierType}`
      )
      return renderServiceError(h, content.errors.notRebrand)
    }

    return h.view('manufacturer-letter/index', {
      pageTitle: content.heading(fuel.name),
      heading: content.heading(fuel.name),
      intro: content.intro,
      passButtonText: content.markPassed,
      failButtonText: content.markFailed,
      cancelText: content.cancel,
      fuel,
      fuelId,
      reviewHref: buildReviewHref(fuelId)
    })
  } catch (error) {
    logger.error(
      `[manufacturerLetter] failed to load ${fuelId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

/**
 * Saves the pass/fail result for the manufacturer-letter review and returns to the review screen.
 */
async function submitManufacturerLetterDecision(request, h) {
  const { fuelId } = request.query
  const pass = checkResult[request.payload.decision]

  if (!fuelId) {
    logger.error('[manufacturerLetter] missing fuelId in query string')
    return renderServiceError(h)
  }

  try {
    await saveManufacturerLetterResult(fuelId, pass)

    return h.redirect(buildReviewHref(fuelId))
  } catch (error) {
    logger.error(
      `[manufacturerLetter] failed to save ${fuelId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

export const manufacturerLetterController = {
  get: loadManufacturerLetterPage,
  post: submitManufacturerLetterDecision
}
