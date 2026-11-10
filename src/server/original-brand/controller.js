import { originalBrandContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelForOriginalBrand,
  saveOriginalBrand
} from './original-brand-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = originalBrandContent.en

function renderOriginalBrandPage(h, fuelId, fuel, formValue, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const originalBrandAction = `/original-brand/${encodeURIComponent(fuelId)}`

  return h.view('original-brand/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
    fuel,
    formValue,
    error,
    fuelDetailsHref,
    originalBrandAction
  })
}

async function handleOriginalBrandRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelForOriginalBrand(fuelId)

    const formValue = fuel.originalFuel.name ?? ''

    return renderOriginalBrandPage(h, fuelId, fuel, formValue, null)
  } catch (error) {
    logger.error(`[originalBrand] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleOriginalBrandDecisionRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const originalNameValue = request.payload.originalName ?? ''
  const trimmed = originalNameValue.trim()

  try {
    if (!trimmed) {
      const { data: fuel } = await getFuelForOriginalBrand(fuelId)

      return renderOriginalBrandPage(h, fuelId, fuel, originalNameValue, {
        field: 'originalName',
        message: content.errors.originalNameRequired,
        href: '#original-name'
      }).code(statusCodes.badRequest)
    }

    await saveOriginalBrand(fuelId, trimmed)

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[originalBrand] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const originalBrandController = {
  handler: handleOriginalBrandRequest
}

const originalBrandDecisionController = {
  handler: handleOriginalBrandDecisionRequest
}

export {
  handleOriginalBrandRequest,
  handleOriginalBrandDecisionRequest,
  originalBrandController,
  originalBrandDecisionController
}
