import { applianceReviewContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview, saveApplianceReview } from './appliance-data.js'
import { buildDocumentationTasks, buildListingTasks } from './review-tasks.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  applicationPath,
  appliancePath,
  buildApplianceBreadcrumbs,
  incompleteReviewPath
} from './navigation.js'

const logger = createLogger()
const content = applianceReviewContent.en

const decisionStatus = {
  accept: 'accepted',
  reject: 'rejected'
}

function buildViewModel(appliance) {
  const applicationHref = applicationPath(appliance.applicationId)

  return {
    pageTitle: content.heading(appliance.modelName),
    heading: content.heading(appliance.modelName),
    content,
    appliance,
    applicationHref,
    applianceHref: appliancePath(appliance.id),
    backLink: { href: applicationHref },
    documentationTasks: buildDocumentationTasks(
      appliance.technicalReview,
      appliance.id
    ),
    listingTasks: buildListingTasks(appliance.technicalReview, appliance.id),
    breadcrumbs: buildApplianceBreadcrumbs(appliance)
  }
}

async function handleApplianceReviewRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceReview(applianceId)

    return h.view('review-appliance/index', buildViewModel(appliance))
  } catch (error) {
    logger.error(
      `[reviewAppliance] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleApplianceDecisionRequest(request, h) {
  const { applianceId } = request.params
  const status = decisionStatus[request.payload.decision]
  const reviewedBy = request.auth?.credentials?.profile

  try {
    await saveApplianceReview(applianceId, status, reviewedBy)

    const { data: appliance } = await getApplianceReview(applianceId)

    return h.redirect(applicationPath(appliance.applicationId))
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      logger.warn(
        `[reviewAppliance] accept refused for ${applianceId}: checks outstanding`
      )

      return h.redirect(incompleteReviewPath(applianceId))
    }

    logger.error(
      `[reviewAppliance] failed to save decision for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const applianceReviewController = {
  handler: handleApplianceReviewRequest
}

const applianceDecisionController = {
  handler: handleApplianceDecisionRequest
}

export {
  handleApplianceReviewRequest,
  handleApplianceDecisionRequest,
  applianceReviewController,
  applianceDecisionController
}
