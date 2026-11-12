import { additionalRebrandNamesContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getFuelForAdditionalRebrandNames,
  saveAdditionalRebrandNames
} from './additional-rebrand-names-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  getAdditionalRebrandNamesValues,
  validateAdditionalRebrandNames
} from './validation.js'

const logger = createLogger()
const content = additionalRebrandNamesContent.en

function renderAdditionalRebrandNamesPage(h, fuelId, fuel, formData, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const action = `/review-fuel/${encodeURIComponent(fuelId)}/additional-rebrand-names`

  const formValues = formData ?? getAdditionalRebrandNamesValues(fuel)
  const additionalBrandNamesValue = formValues.additionalBrandNames
  const hasAdditionalBrandNames = formValues.hasAdditionalBrandNames

  return h.view('additional-rebrand-names/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
    fuel,
    hasAdditionalBrandNames,
    additionalBrandNamesValue,
    error,
    fuelDetailsHref,
    action
  })
}

async function handleAdditionalRebrandNamesRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelForAdditionalRebrandNames(fuelId)

    return renderAdditionalRebrandNamesPage(
      h,
      fuelId,
      fuel,
      getAdditionalRebrandNamesValues(fuel),
      null
    )
  } catch (error) {
    logger.error(
      `[additionalRebrandNames] failed to load ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleAdditionalRebrandNamesDecisionRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const payload = request.payload ?? {}
  const validation = validateAdditionalRebrandNames(payload)

  try {
    if (!validation.isValid) {
      const { data: fuel } = await getFuelForAdditionalRebrandNames(fuelId)

      return renderAdditionalRebrandNamesPage(
        h,
        fuelId,
        fuel,
        validation.values,
        validation.errorList[0]
      ).code(statusCodes.badRequest)
    }

    await saveAdditionalRebrandNames(
      fuelId,
      validation.values.hasAdditionalBrandNames
        ? validation.values.additionalBrandNames.trim()
        : null
    )

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(
      `[additionalRebrandNames] failed to save ${fuelId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const additionalRebrandNamesController = {
  handler: handleAdditionalRebrandNamesRequest
}

const additionalRebrandNamesDecisionController = {
  handler: handleAdditionalRebrandNamesDecisionRequest
}

export {
  handleAdditionalRebrandNamesRequest,
  handleAdditionalRebrandNamesDecisionRequest,
  additionalRebrandNamesController,
  additionalRebrandNamesDecisionController
}
