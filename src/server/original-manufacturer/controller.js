import { originalManufacturerContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelForOriginalManufacturer,
  saveOriginalManufacturer
} from './original-manufacturer-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = originalManufacturerContent.en

function renderOriginalManufacturerPage(h, fuelId, fuel, formValue, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const originalManufacturerAction = `/review-fuel/${encodeURIComponent(fuelId)}/original-manufacturer`

  return h.view('original-manufacturer/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
    fuel,
    formValue,
    error,
    fuelDetailsHref,
    originalManufacturerAction
  })
}

async function handleOriginalManufacturerRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelForOriginalManufacturer(fuelId)

    const formValue = fuel.originalFuel.manufacturer ?? ''

    return renderOriginalManufacturerPage(h, fuelId, fuel, formValue, null)
  } catch (error) {
    logger.error(
      `[originalManufacturer] failed to load ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleOriginalManufacturerDecisionRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const manufacturerValue = request.payload.manufacturer ?? ''
  const trimmed = manufacturerValue.trim()

  try {
    if (!trimmed) {
      const { data: fuel } = await getFuelForOriginalManufacturer(fuelId)

      return renderOriginalManufacturerPage(
        h,
        fuelId,
        fuel,
        manufacturerValue,
        {
          field: 'manufacturer',
          message: content.errors.originalManufacturerRequired,
          href: '#original-fuel-manufacturer'
        }
      ).code(statusCodes.badRequest)
    }

    await saveOriginalManufacturer(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(
      `[originalManufacturer] failed to save ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const originalManufacturerController = {
  handler: handleOriginalManufacturerRequest
}

const originalManufacturerDecisionController = {
  handler: handleOriginalManufacturerDecisionRequest
}

export {
  handleOriginalManufacturerRequest,
  handleOriginalManufacturerDecisionRequest,
  originalManufacturerController,
  originalManufacturerDecisionController
}
