import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { fuelApplicationsContent } from './content.js'
import {
  getFuelApplications,
  startFuelApplicationReview
} from './fuel-applications-data.js'
import {
  buildFuelApplicationReviewer,
  buildFuelApplicationsViewModel,
  normaliseApplicationsSummary
} from './fuel-applications-helpers.js'

const logger = createLogger()
const content = fuelApplicationsContent.en

function logFuelApplicationsError(error) {
  logger.error('[fuel-applications.GET] failed', {
    route: '/fuel-applications',
    operation: 'getFuelApplications',
    message: error?.message ?? 'Unknown error',
    stack: error?.stack
  })
}

async function handleFuelApplicationsRequest(_request, h) {
  try {
    const response = await getFuelApplications()
    const applications = normaliseApplicationsSummary(response)

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

async function handleStartFuelApplicationReviewRequest(request, h) {
  const { applicationId } = request.params
  const user = request.auth?.credentials?.user

  if (!user?.name || !user?.email) {
    logger.warn(
      `[fuel-applications] missing reviewer name/email in auth credentials for ${applicationId}, falling back to unknown reviewer`
    )
  }

  const reviewedBy = buildFuelApplicationReviewer(user)

  try {
    await startFuelApplicationReview(applicationId, reviewedBy)

    return h.redirect('/fuel-applications')
  } catch (error) {
    if (error.status === statusCodes.conflict) {
      return h.redirect('/fuel-applications')
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
