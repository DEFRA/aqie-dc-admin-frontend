import { legacyCommentsContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceTechnicalReview } from '../../common/services/common-appliance-service.js'
import { getLegacyComments } from './legacy-comments-data.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = legacyCommentsContent.en

/**
 * Normalises a single comment entry to a display string.
 * Handles both pre-formatted strings and structured objects
 * { date, user, role, email, text } so the template stays simple.
 */
function normalizeComment(comment) {
  if (typeof comment === 'string') return comment

  const parts = []
  if (comment.date) parts.push(`[${comment.date}]`)
  if (comment.user && comment.role) {
    parts.push(`${comment.user} / ${comment.role}`)
  } else if (comment.user) {
    parts.push(comment.user)
  }
  if (comment.email) parts.push(`(${comment.email}):`)
  if (comment.text) parts.push(comment.text)
  return parts.join(' ')
}

function buildViewModel(appliance, comments, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const normalizedComments = (comments ?? []).map(normalizeComment)
  const { breadcrumbs, returnToRecord } = buildSubPageBreadcrumbs(
    appliance.modelName,
    returnHref
  )

  return {
    pageTitle: `${content.headingPrefix} ${appliance.modelName}`,
    heading: `${content.headingPrefix} ${appliance.modelName}`,
    comments: normalizedComments,
    noComments: content.noComments,
    backLink: { href: returnHref },
    returnHref,
    returnToRecord,
    breadcrumbs
  }
}

async function handleLegacyCommentsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceTechnicalReview(applianceId)
    const { data: comments } = await getLegacyComments(applianceId)

    return h.view(
      'appliance-record/legacy-comments/index',
      buildViewModel(appliance, comments, applianceId)
    )
  } catch (error) {
    logger.error(
      `[legacyComments] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const legacyCommentsController = {
  handler: handleLegacyCommentsRequest
}

export { handleLegacyCommentsRequest }
