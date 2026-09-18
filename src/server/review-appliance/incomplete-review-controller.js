import { applianceReviewContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview } from './appliance-data.js'
import { appliancePath, buildApplianceBreadcrumbs } from './navigation.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceReviewContent.en
const { incompleteReview } = content

function buildViewModel(appliance) {
  const applianceHref = appliancePath(appliance.id)

  return {
    pageTitle: incompleteReview.heading,
    heading: incompleteReview.heading,
    intro: incompleteReview.intro(appliance.modelName),
    conditions: incompleteReview.conditions,
    returnLinkText: incompleteReview.returnLink(appliance.modelName),
    applianceHref,
    backLink: { href: applianceHref },
    breadcrumbs: buildApplianceBreadcrumbs(appliance, { linkAppliance: true })
  }
}

async function handleIncompleteReviewRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceReview(applianceId)

    return h.view(
      'review-appliance/incomplete-review',
      buildViewModel(appliance)
    )
  } catch (error) {
    logger.error(
      `[incompleteReview] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const incompleteReviewController = {
  handler: handleIncompleteReviewRequest
}

export { handleIncompleteReviewRequest, incompleteReviewController }
