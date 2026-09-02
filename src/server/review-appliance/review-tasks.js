import { applianceReviewContent } from './content.js'

/**
 * Builds the two GOV.UK task lists shown on the review appliance screen.
 *
 * Documentation checks are tri-state: passed, failed, or not yet reviewed.
 * Listing checks are binary: completed or not.
 *
 * The status objects themselves live in content.js, ready to hand to
 * govukTaskList.
 */

const content = applianceReviewContent.en

function toDocumentationStatus(value, statuses) {
  if (value === true) {
    return statuses.passed
  }
  if (value === false) {
    return statuses.failed
  }
  return statuses.notReviewed
}

function toListingStatus(value, statuses) {
  return value === true ? statuses.completed : statuses.notCompleted
}

function toTasks(checks, definitions, toStatus, statuses, applianceId) {
  return definitions.map(({ key, title, path }) => ({
    title: { text: title },
    href: `/review-appliance/${encodeURIComponent(applianceId)}/${path}`,
    status: toStatus(checks?.[key], statuses)
  }))
}

export function buildDocumentationTasks(technicalReview, applianceId) {
  return toTasks(
    technicalReview?.documentationReviewed,
    content.documentationTasks,
    toDocumentationStatus,
    content.documentationStatuses,
    applianceId
  )
}

export function buildListingTasks(technicalReview, applianceId) {
  return toTasks(
    technicalReview?.checksCompleted,
    content.listingTasks,
    toListingStatus,
    content.listingStatuses,
    applianceId
  )
}
