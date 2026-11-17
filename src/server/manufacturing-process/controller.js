import { manufacturingProcessContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getManufacturingProcess,
  saveManufacturingProcess
} from './manufacturing-process-data.js'
import { getFuelDescriptionFieldReturnHref } from '../common/helpers/fuel-description-field-return-href.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = manufacturingProcessContent.en

function renderPage(h, fuelId, returnHref, value, error) {
  return h.view('manufacturing-process/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    value,
    error,
    returnHref,
    manufacturingProcessAction: `/review-fuel/${encodeURIComponent(fuelId)}/manufacturing-process`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

async function handleManufacturingProcessRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getManufacturingProcess(fuelId)

    // manufacturingProcess is a top-level field, empty on first entry
    return renderPage(
      h,
      fuelId,
      getFuelDescriptionFieldReturnHref(fuel, fuelId),
      fuel.manufacturingProcess ?? '',
      null
    )
  } catch (error) {
    logger.error(
      `[manufacturingProcess] failed to load ${fuelId}: ${error.message}`
    )

    return renderServiceError(h)
  }
}

async function handleManufacturingProcessSaveRequest(request, h) {
  const { fuelId } = request.params
  const manufacturingProcess = request.payload.manufacturingProcess ?? ''
  const trimmed = manufacturingProcess.trim()

  try {
    const { data: fuel } = await getManufacturingProcess(fuelId)
    const returnHref = getFuelDescriptionFieldReturnHref(fuel, fuelId)

    if (!trimmed) {
      return renderPage(h, fuelId, returnHref, manufacturingProcess, {
        field: 'manufacturingProcess',
        message: content.errors.manufacturingProcessRequired,
        href: '#manufacturingProcess'
      }).code(statusCodes.badRequest)
    }

    await saveManufacturingProcess(fuelId, trimmed)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(
      `[manufacturingProcess] failed to save ${fuelId}: ${error.message}`
    )

    return renderServiceError(h)
  }
}

export const manufacturingProcessController = {
  handler: handleManufacturingProcessRequest
}

export const manufacturingProcessSaveController = {
  handler: handleManufacturingProcessSaveRequest
}

export {
  handleManufacturingProcessRequest,
  handleManufacturingProcessSaveRequest
}
