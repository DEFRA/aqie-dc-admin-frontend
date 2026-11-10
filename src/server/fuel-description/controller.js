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

function buildFieldHrefs(encoded) {
  return {
    appearance: `/review-fuel/${encoded}/fuel-description/fuel-appearance`,
    weight: `/review-fuel/${encoded}/fuel-description/fuel-weight`,
    composition: `/review-fuel/${encoded}/fuel-description/fuel-composition`,
    sulphurContent: `/review-fuel/${encoded}/fuel-description/sulphur-content`,
    manufacturingProcess: `/review-fuel/${encoded}/fuel-description/manufacturing-process`
  }
}

function buildDescriptionRows(fuel, hrefs, errors) {
  const desc = fuel.fuelDescription ?? {}
  return [
    buildDescriptionRow(
      content.labels.fuelAppearance,
      desc.appearance,
      hrefs.appearance,
      errors?.appearance
    ),
    buildDescriptionRow(
      content.labels.fuelWeight,
      desc.weight,
      hrefs.weight,
      errors?.weight
    ),
    buildDescriptionRow(
      content.labels.fuelComposition,
      desc.composition,
      hrefs.composition,
      errors?.composition
    ),
    buildDescriptionRow(
      content.labels.sulphurContent,
      desc.sulphurContent,
      hrefs.sulphurContent,
      errors?.sulphurContent
    ),
    buildDescriptionRow(
      content.labels.manufacturingProcess,
      fuel.manufacturingProcess,
      hrefs.manufacturingProcess,
      errors?.manufacturingProcess
    )
  ]
}

function buildErrorSummaryItems(errors, hrefs) {
  return Object.entries(errors).map(([key, message]) => ({
    text: message,
    href: hrefs[key]
  }))
}

function validateFields(fuel) {
  const desc = fuel.fuelDescription ?? {}
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
  if (desc.sulphurContent === null || desc.sulphurContent === undefined) {
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
  const hrefs = buildFieldHrefs(encoded)

  return {
    pageTitle: errors
      ? `Error: ${content.pageTitle(name)}`
      : content.pageTitle(name),
    heading: content.heading(name),
    content,
    originalFuelRows: buildOriginalFuelRows(fuel),
    descriptionRows: buildDescriptionRows(fuel, hrefs, errors),
    errorSummaryItems: errors ? buildErrorSummaryItems(errors, hrefs) : null,
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

    if (fuel.technicalReview.listingChecks.fuelDescription === true) {
      return h.redirect(returnHref)
    }

    const errors = validateFields(fuel)

    if (errors) {
      return h
        .view('fuel-description/index', buildViewModel(fuel, fuelId, errors))
        .code(statusCodes.badRequest)
    }

    const desc = fuel.fuelDescription ?? {}
    await saveFuelDescriptionCheck(fuelId, {
      fuelDescription: {
        appearance: desc.appearance,
        weight: desc.weight,
        composition: desc.composition,
        sulphurContent: desc.sulphurContent
      },
      manufacturingProcess: fuel.manufacturingProcess
    })

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
