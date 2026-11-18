import { qualityControlContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getQualityControl,
  saveQualityControl
} from './quality-control-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = qualityControlContent.en

// Ticket: save and cancel both return to "Check fuel details".
// Route path assumed; confirm against fuel-details/index.js.
const getFuelDetailsHref = (fuelId) =>
  `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`

function toFormValue(value) {
  if (value === true) {
    return 'yes'
  }
  if (value === false) {
    return 'no'
  }
  return ''
}

function renderPage(h, fuelId, formValue, error) {
  return h.view('quality-control/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: getFuelDetailsHref(fuelId),
    qualityControlAction: `/review-fuel/${encodeURIComponent(fuelId)}/quality-control`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

async function handleQualityControlRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getQualityControl(fuelId)

    return renderPage(
      h,
      fuelId,
      toFormValue(fuel.hasQualityControlSystem),
      null
    )
  } catch (error) {
    logger.error(`[qualityControl] failed to load ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

async function handleQualityControlSaveRequest(request, h) {
  const { fuelId } = request.params
  const { qualityControl } = request.payload

  try {
    await saveQualityControl(fuelId, qualityControl === 'yes')

    return h.redirect(getFuelDetailsHref(fuelId))
  } catch (error) {
    logger.error(`[qualityControl] failed to save ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

export const qualityControlController = {
  handler: handleQualityControlRequest
}

export const qualityControlSaveController = {
  handler: handleQualityControlSaveRequest
}

export { handleQualityControlRequest, handleQualityControlSaveRequest }
