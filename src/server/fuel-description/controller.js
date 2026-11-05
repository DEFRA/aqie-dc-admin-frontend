import { fuelDescriptionContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelDescription,
  saveFuelDescriptionCheck
} from './fuel-description-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = fuelDescriptionContent.en

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

function buildDescriptionRow(label, value, href, errorMessage) {
  if (errorMessage) {
    return {
      key: { text: label },
      value: {
        html: `<p class="govuk-error-message">${errorMessage}</p>`
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

function buildDescriptionRows(fuel, encoded, errors) {
  return [
    buildDescriptionRow(
      content.labels.fuelAppearance,
      fuel.fuelDescription.appearance,
      `/fuel-appearance/${encoded}`,
      errors && errors.appearance
    ),
    buildDescriptionRow(
      content.labels.fuelWeight,
      fuel.fuelDescription.weight,
      `/fuel-weight/${encoded}`,
      errors && errors.weight
    ),
    buildDescriptionRow(
      content.labels.fuelComposition,
      fuel.fuelDescription.composition,
      `/fuel-composition/${encoded}`,
      errors && errors.composition
    ),
    buildDescriptionRow(
      content.labels.sulphurContent,
      fuel.fuelDescription.sulphurContent,
      `/sulphur-content/${encoded}`,
      errors && errors.sulphurContent
    ),
    buildDescriptionRow(
      content.labels.manufacturingProcess,
      fuel.manufacturingProcess,
      `/manufacturing-process/${encoded}`,
      errors && errors.manufacturingProcess
    )
  ]
}

function buildErrorSummaryItems(errors, encoded) {
  const hrefMap = {
    appearance: `/fuel-appearance/${encoded}`,
    weight: `/fuel-weight/${encoded}`,
    composition: `/fuel-composition/${encoded}`,
    sulphurContent: `/sulphur-content/${encoded}`,
    manufacturingProcess: `/manufacturing-process/${encoded}`
  }
  return Object.entries(errors).map(([key, message]) => ({
    text: message,
    href: hrefMap[key]
  }))
}

function validateFields(fuel) {
  const errors = {}

  if (!fuel.fuelDescription.appearance) {
    errors.appearance = content.errors.fuelAppearance
  }
  if (!fuel.fuelDescription.weight) {
    errors.weight = content.errors.fuelWeight
  }
  if (!fuel.fuelDescription.composition) {
    errors.composition = content.errors.fuelComposition
  }
  if (
    fuel.fuelDescription.sulphurContent === null ||
    fuel.fuelDescription.sulphurContent === undefined
  ) {
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
  const name = fuel.name ?? content.notProvided

  return {
    pageTitle: errors
      ? `Error: ${content.pageTitle(name)}`
      : content.pageTitle(name),
    heading: content.heading(name),
    content,
    originalFuelRows: buildOriginalFuelRows(fuel),
    descriptionRows: buildDescriptionRows(fuel, encoded, errors),
    errorSummaryItems: errors ? buildErrorSummaryItems(errors, encoded) : null,
    fuelDescriptionAction: `/review-fuel/${encoded}/fuel-description`,
    cancelHref: returnHref,
    isAlreadyComplete:
      fuel.technicalReview.listingChecks.fuelDescription === true
  }
}

async function handleFuelDescriptionRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelDescription(fuelId)
    return h.view('fuel-description/index', buildViewModel(fuel, fuelId, null))
  } catch (error) {
    logger.error(`[fuelDescription] failed to load ${fuelId}: ${error.message}`)
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelDescriptionMarkCompleteRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelDescription(fuelId)
    const returnHref = `/review-fuel/${encodeURIComponent(fuelId)}`

    if (fuel.technicalReview.listingChecks.fuelDescription === true) {
      return h.redirect(returnHref)
    }

    const errors = validateFields(fuel)

    if (errors) {
      return h
        .view('fuel-description/index', buildViewModel(fuel, fuelId, errors))
        .code(statusCodes.badRequest)
    }

    await saveFuelDescriptionCheck(fuelId, {
      fuelDescription: {
        appearance: fuel.fuelDescription.appearance,
        weight: fuel.fuelDescription.weight,
        composition: fuel.fuelDescription.composition,
        sulphurContent: fuel.fuelDescription.sulphurContent
      },
      manufacturingProcess: fuel.manufacturingProcess
    })

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(
      `[fuelDescription] failed to mark complete ${fuelId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
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
