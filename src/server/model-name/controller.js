import { modelNameContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceForModelName, saveModelName } from './model-name-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = modelNameContent.en

function renderModelNamePage(h, applianceId, appliance, formValue, error) {
  const heading = content.heading
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const modelNameAction = `/review-appliance/${encodeURIComponent(applianceId)}/model-name`

  return h.view('model-name/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    formValue,
    error,
    applianceDetailsHref,
    modelNameAction
  })
}

async function handleModelNameRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForModelName(applianceId)

    return renderModelNamePage(
      h,
      applianceId,
      appliance,
      appliance.modelName ?? '',
      null
    )
  } catch (error) {
    logger.error(`[modelName] failed to load ${applianceId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleModelNameDecisionRequest(request, h) {
  const { applianceId } = request.params
  const detailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const modelNameValue = request.payload.modelName ?? ''
  const trimmed = modelNameValue.trim()

  try {
    if (!trimmed) {
      const { data: appliance } = await getApplianceForModelName(applianceId)

      return renderModelNamePage(h, applianceId, appliance, modelNameValue, {
        field: 'modelName',
        message: content.errors.modelNameRequired,
        href: '#model-name'
      }).code(statusCodes.badRequest)
    }

    await saveModelName(applianceId, trimmed)

    return h.redirect(detailsHref)
  } catch (error) {
    logger.error(`[modelName] failed to save ${applianceId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const modelNameController = {
  handler: handleModelNameRequest
}

const modelNameDecisionController = {
  handler: handleModelNameDecisionRequest
}

export {
  handleModelNameRequest,
  handleModelNameDecisionRequest,
  modelNameController,
  modelNameDecisionController
}
