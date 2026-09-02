import { applianceReviewContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview, saveApplianceReview } from './appliance-data.js'
import { buildDocumentationTasks, buildListingTasks } from './review-tasks.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceReviewContent.en

const decisionStatus = {
  accept: 'accepted',
  reject: 'rejected'
}

function buildViewModel(appliance, incompleteError) {
  const applicationHref = `/review-appliance-application/${encodeURIComponent(appliance.applicationId)}`

  return {
    pageTitle: `Review ${appliance.modelName}`,
    heading: `Review ${appliance.modelName}`,
    content,
    appliance,
    applicationHref,
    incompleteError,
    documentationTasks: buildDocumentationTasks(
      appliance.technicalReview,
      appliance.id
    ),
    listingTasks: buildListingTasks(appliance.technicalReview, appliance.id),
    breadcrumbs: [
      { text: 'Home', href: '/dashboard' },
      { text: content.applicationsHeading, href: '/applications-appliances' },
      {
        text: `Review appliance application ${appliance.applicationId}`,
        href: applicationHref
      },
      { text: `Review ${appliance.modelName}` }
    ]
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

    return h.redirect(
      `/review-appliance-application/${encodeURIComponent(appliance.applicationId)}`
    )
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      logger.warn(
        `[reviewAppliance] accept refused for ${applianceId}: checks outstanding`
      )

      const { data: appliance } = await getApplianceReview(applianceId)

      return h
        .view(
          'review-appliance/index',
          buildViewModel(appliance, content.errors.incomplete)
        )
        .code(statusCodes.badRequest)
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
