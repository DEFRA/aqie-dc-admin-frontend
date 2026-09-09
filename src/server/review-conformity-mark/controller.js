import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceReview } from '../review-appliance/appliance-data.js'
import { patchJson } from '../common/api/api.js'
import { conformityContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = conformityContent.en

async function handleGetRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceReview(applianceId)

    return h.view('review-conformity-mark/index', {
      pageTitle: content.heading(appliance.modelName),
      heading: content.heading(appliance.modelName),
      intro: content.intro,
      appliance
    })
  } catch (error) {
    logger.error(`[reviewConformity] failed to load ${applianceId}: ${error.message}`)
    return h
      .view('error/index', { message: 'Sorry, there is a problem with the service' })
      .code(statusCodes.internalServerError)
  }
}

async function handlePostRequest(request, h) {
  const { applianceId } = request.params
  const pass = request.payload.decision === 'pass'

  try {
    await patchJson(
      `/appliances/${encodeURIComponent(applianceId)}/technical-review`,
      { documentationChecks: { conformityMark: pass } }
    )

    return h.redirect(
      `/review-appliance/${encodeURIComponent(applianceId)}?confstatusCS=${pass ? 'pass' : 'fail'}`
    )
  } catch (error) {
    logger.error(`[reviewConformity] failed to save ${applianceId}: ${error.message}`)
    return h
      .view('error/index', { message: 'Sorry, there is a problem with the service' })
      .code(statusCodes.internalServerError)
  }
}

export const reviewConformityController = {
  get: handleGetRequest,
  post: handlePostRequest
}
