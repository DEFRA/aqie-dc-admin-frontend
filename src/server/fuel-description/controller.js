import { fuelDescriptionContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelDescription,
  markFuelDescriptionComplete
} from './fuel-description-data.js'
import {
  FUEL_DESCRIPTION_FIELDS,
  getFuelDescriptionFieldHref
} from '../common/helpers/fuel-description-fields.js'
import { SUPPLIER_TYPE } from '../common/constants/supplier-type.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelDescriptionContent.en

// Backend contract: fuelDescription is null for a rebrand until the first field is added
const getDescription = (fuel) => fuel.fuelDescription ?? {}

function buildOriginalFuelRows(fuel) {
  return [
    {
      key: { text: content.labels.originalManufacturer },
      value: { text: fuel.originalFuel.manufacturer }
    },
    {
      key: { text: content.labels.originalBrandName },
      value: { text: fuel.originalFuel.name }
    }
  ]
}

const errorMessageId = (key) => `${key}-error`

function buildDescriptionRow(key, label, value, href, errorMessage) {
  if (errorMessage) {
    return {
      key: { text: label },
      value: {
        // Mirrors govukErrorMessage markup; errorMessage is static content.js text.
        html: `<p id="${errorMessageId(key)}" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> ${errorMessage}</p>`
      },
      actions: { items: [{ href, text: content.actions.add }] }
    }
  }
  return {
    key: { text: label },
    value: { text: value ?? '' },
    actions: { items: [{ href, text: content.actions.add }] }
  }
}

function buildDescriptionRows(fuel, fuelId, errors) {
  return FUEL_DESCRIPTION_FIELDS.map((field) =>
    buildDescriptionRow(
      field.key,
      content.labels[field.labelKey],
      field.getValue(fuel),
      getFuelDescriptionFieldHref(field, fuelId),
      errors?.[field.key]
    )
  )
}

function buildErrorSummaryItems(errors) {
  return Object.entries(errors).map(([key, message]) => ({
    text: message,
    href: `#${errorMessageId(key)}`
  }))
}

function validateFields(fuel) {
  const desc = getDescription(fuel)
  const errors = {}

  if (!desc.appearance) {
    errors.appearance = content.errors.fuelAppearance
  }
  if (!desc.weight) {
    errors.weight = content.errors.fuelWeight
  }
  if (!desc.composition) {
    errors.composition = content.errors.fuelComposition
  }
  // 0 is a valid sulphur content; null, undefined and '' are not
  if (desc.sulphurContent == null || desc.sulphurContent === '') {
    errors.sulphurContent = content.errors.sulphurContent
  }
  if (!fuel.manufacturingProcess) {
    errors.manufacturingProcess = content.errors.manufacturingProcess
  }

  return Object.keys(errors).length > 0 ? errors : null
}

function buildViewModel(fuel, fuelId, errors) {
  const encoded = encodeURIComponent(fuelId)
  const returnHref = `/review-fuel/${encoded}`

  return {
    pageTitle: errors
      ? `Error: ${content.pageTitle(fuel.name)}`
      : content.pageTitle(fuel.name),
    heading: content.heading(fuel.name),
    content,
    originalFuelRows: buildOriginalFuelRows(fuel),
    descriptionRows: buildDescriptionRows(fuel, fuelId, errors),
    errorSummaryItems: errors ? buildErrorSummaryItems(errors) : null,
    fuelDescriptionAction: `/review-fuel/${encoded}/fuel-description`,
    cancelHref: returnHref
  }
}

async function handleFuelDescriptionRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelDescription(fuelId)

    if (fuel.supplierType !== SUPPLIER_TYPE.REBRAND) {
      return h.redirect(`/review-fuel/${encodeURIComponent(fuelId)}`)
    }

    return h.view('fuel-description/index', buildViewModel(fuel, fuelId, null))
  } catch (error) {
    const code =
      error.status === statusCodes.notFound
        ? statusCodes.notFound
        : statusCodes.internalServerError
    logger.error(`[fuelDescription] failed to load ${fuelId}: ${error.message}`)
    return h.view('error/index', { message: content.errors.generic }).code(code)
  }
}

async function handleFuelDescriptionMarkCompleteRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelDescription(fuelId)
    const returnHref = `/review-fuel/${encodeURIComponent(fuelId)}`

    if (fuel.supplierType !== SUPPLIER_TYPE.REBRAND) {
      return h.redirect(returnHref)
    }

    const errors = validateFields(fuel)

    if (errors) {
      return h
        .view('fuel-description/index', buildViewModel(fuel, fuelId, errors))
        .code(statusCodes.badRequest)
    }

    await markFuelDescriptionComplete(fuelId)

    return h.redirect(returnHref)
  } catch (error) {
    const code =
      error.status === statusCodes.notFound
        ? statusCodes.notFound
        : statusCodes.internalServerError
    logger.error(
      `[fuelDescription] failed to mark complete ${fuelId}: ${error.message}`
    )
    return h.view('error/index', { message: content.errors.generic }).code(code)
  }
}

export const fuelDescriptionController = {
  handler: handleFuelDescriptionRequest
}

export const fuelDescriptionMarkCompleteController = {
  handler: handleFuelDescriptionMarkCompleteRequest
}

export {
  handleFuelDescriptionRequest,
  handleFuelDescriptionMarkCompleteRequest
}
