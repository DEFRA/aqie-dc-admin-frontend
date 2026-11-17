import { sulphurContentContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getSulphurContent,
  saveSulphurContent
} from './sulphur-content-data.js'
import { getFuelDescriptionFieldReturnHref } from '../common/helpers/fuel-description-field-return-href.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = sulphurContentContent.en

// Whole or decimal, non-negative numbers only (for example 5 or 0.1)
const NUMBER_PATTERN = /^\d+(\.\d+)?$/

// Mirrors the backend fuelDescription schema: sulphurContent max(100)
const MAX_SULPHUR_CONTENT = 100

function renderPage(h, fuelId, returnHref, formValue, error) {
  return h.view('sulphur-content/index', {
    pageTitle: error ? `Error: ${content.heading}` : content.heading,
    content,
    formValue,
    error,
    fuelDetailsHref: returnHref,
    sulphurContentAction: `/review-fuel/${encodeURIComponent(fuelId)}/sulphur-content`
  })
}

function renderServiceError(h) {
  return h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)
}

function getValidationMessage(trimmed) {
  if (!trimmed) {
    return content.errors.sulphurContentRequired
  }

  if (!NUMBER_PATTERN.test(trimmed)) {
    return content.errors.sulphurContentInvalid
  }

  if (Number(trimmed) > MAX_SULPHUR_CONTENT) {
    return content.errors.sulphurContentTooHigh
  }

  return null
}

async function handleSulphurContentRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getSulphurContent(fuelId)

    return renderPage(
      h,
      fuelId,
      getFuelDescriptionFieldReturnHref(fuel, fuelId),
      fuel.fuelDescription?.sulphurContent ?? '',
      null
    )
  } catch (error) {
    logger.error(`[sulphurContent] failed to load ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

async function handleSulphurContentSaveRequest(request, h) {
  const { fuelId } = request.params
  const sulphurContent = request.payload.sulphurContent ?? ''
  const trimmed = sulphurContent.trim()

  try {
    const { data: fuel } = await getSulphurContent(fuelId)
    const returnHref = getFuelDescriptionFieldReturnHref(fuel, fuelId)
    const message = getValidationMessage(trimmed)

    if (message) {
      return renderPage(h, fuelId, returnHref, sulphurContent, {
        field: 'sulphurContent',
        message,
        href: '#sulphurContent'
      }).code(statusCodes.badRequest)
    }

    await saveSulphurContent(fuelId, trimmed)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(`[sulphurContent] failed to save ${fuelId}: ${error.message}`)

    return renderServiceError(h)
  }
}

export const sulphurContentController = {
  handler: handleSulphurContentRequest
}

export const sulphurContentSaveController = {
  handler: handleSulphurContentSaveRequest
}

export { handleSulphurContentRequest, handleSulphurContentSaveRequest }
