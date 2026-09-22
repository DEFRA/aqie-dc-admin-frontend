import { modelNumberContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForModelNumber,
  saveModelNumber
} from './model-number-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = modelNumberContent.en

function renderModelNumberPage(h, applianceId, appliance, formValue, error) {
  const heading = content.heading(appliance.modelName)
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  return h.view('model-number/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    formValue,
    error,
    applianceDetailsHref
  })
}

async function handleModelNumberRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForModelNumber(applianceId)

    return renderModelNumberPage(
      h,
      applianceId,
      appliance,
      appliance.modelNumber ?? '',
      null
    )
  } catch (error) {
    logger.error(
      `[modelNumber] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleModelNumberDecisionRequest(request, h) {
  const { applianceId } = request.params
  const detailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const modelNumberValue = request.payload.modelNumber ?? ''
  const trimmed = modelNumberValue.trim()

  try {
    if (!trimmed) {
      const { data: appliance } = await getApplianceForModelNumber(applianceId)

      return renderModelNumberPage(
        h,
        applianceId,
        appliance,
        modelNumberValue,
        {
          field: 'modelNumber',
          message: content.errors.modelNumberRequired,
          href: '#model-number'
        }
      ).code(statusCodes.badRequest)
    }

    await saveModelNumber(applianceId, trimmed)

    return h.redirect(detailsHref)
  } catch (error) {
    logger.error(
      `[modelNumber] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const modelNumberController = {
  handler: handleModelNumberRequest
}

const modelNumberDecisionController = {
  handler: handleModelNumberDecisionRequest
}

export {
  handleModelNumberRequest,
  handleModelNumberDecisionRequest,
  modelNumberController,
  modelNumberDecisionController
}
