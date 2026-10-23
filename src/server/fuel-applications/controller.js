import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { fuelApplicationsContent } from './content.js'
import {
  getFuelApplications,
  startFuelApplicationReview
} from './fuel-applications-data.js'
import {
  buildFuelApplicationReviewer,
  buildFuelApplicationsViewModel
} from './fuel-applications-helpers.js'

const logger = createLogger()
const content = fuelApplicationsContent.en

/**
 * Logs a failed fuel applications list request with route and operation context.
 * @param {Error} [error] - The caught exception from the data layer.
 */
function logFuelApplicationsError(error) {
  logger.error('[fuel-applications.GET] failed', {
    route: '/fuel-applications',
    operation: 'getFuelApplications',
    message: error?.message ?? 'Unknown error',
    stack: error?.stack
  })
}

/**
 * Renders the list page for fuel applications that are awaiting review or
 * already in progress.
 * @param {object} _request - The incoming Hapi request.
 * @param {object} h - The Hapi response toolkit.
 * @returns {Promise<object>} The rendered fuel applications page or error view.
 */
async function handleFuelApplicationsRequest(_request, h) {
  try {
    const response = await getFuelApplications()
    const applications = response.data

    return h.view(
      'fuel-applications/index',
      buildFuelApplicationsViewModel(applications)
    )
  } catch (error) {
    logFuelApplicationsError(error)

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

/**
 * Starts a fuel application review by marking the application as in progress and
 * recording the reviewer details supplied by the authenticated user.
 * @param {object} request - The incoming Hapi request with the application id.
 * @param {object} h - The Hapi response toolkit.
 * @returns {Promise<object>} Redirect to the list or an error page.
 */
async function handleStartFuelApplicationReviewRequest(request, h) {
  const { applicationId } = request.params
  const user = request.auth?.credentials?.user

  if (!user?.name || !user?.email) {
    logger.warn(
      `[fuel-applications] missing reviewer name/email in auth credentials for ${applicationId}, falling back to unknown reviewer`
    )
  }

  const reviewedBy = buildFuelApplicationReviewer(user)

  const encodedApplicationId = encodeURIComponent(applicationId)

  try {
    await startFuelApplicationReview(applicationId, reviewedBy)

    return h.redirect(`/review-fuel-application/${encodedApplicationId}`)
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      return h.redirect(`/review-fuel-application/${encodedApplicationId}`)
    }

    logger.error('[fuel-applications.POST] failed to start review', {
      route: '/review-fuel-application/{applicationId}/start',
      applicationId,
      message: error?.message ?? 'Unknown error',
      stack: error?.stack
    })

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const fuelApplicationsController = {
  handler: handleFuelApplicationsRequest
}

const startFuelApplicationReviewController = {
  handler: handleStartFuelApplicationReviewRequest
}

export {
  handleFuelApplicationsRequest,
  fuelApplicationsController,
  handleStartFuelApplicationReviewRequest,
  startFuelApplicationReviewController
}
