import { fuelChangesContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelForFuelChanges, saveFuelChanges } from './fuel-changes-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { getFuelChangesValues, validateFuelChanges } from './validation.js'

const logger = createLogger()
const content = fuelChangesContent.en

function buildFuelDetailsHref(fuelId) {
  return `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
}

function renderFuelChangesPage(h, fuelId, fuel, formValues, error) {
  const heading = content.heading
  const fuelDetailsHref = buildFuelDetailsHref(fuelId)
  const action = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-changes`

  const changesValue = formValues.changes
  const hasFuelChanges = formValues.hasFuelChanges

  return h.view('fuel-changes/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    content,
    fuel,
    hasFuelChanges,
    changesValue,
    error,
    fuelDetailsHref,
    action
  })
}

async function handleFuelChangesRequest(request, h) {
  const { fuelId } = request.params

  try {
    const { data: fuel } = await getFuelForFuelChanges(fuelId)

    if (fuel.supplierType !== 'Rebrand') {
      logger.warn(
        `[fuelChanges] attempted to load non-Rebrand fuel ${fuelId}: ${fuel.supplierType}`
      )
      return h.redirect(buildFuelDetailsHref(fuelId))
    }

    return renderFuelChangesPage(
      h,
      fuelId,
      fuel,
      getFuelChangesValues(fuel),
      null
    )
  } catch (error) {
    logger.error(`[fuelChanges] failed to load ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleFuelChangesDecisionRequest(request, h) {
  const { fuelId } = request.params
  const fuelDetailsHref = buildFuelDetailsHref(fuelId)
  const payload = request.payload ?? {}
  const validation = validateFuelChanges(payload)

  try {
    const { data: fuel } = await getFuelForFuelChanges(fuelId)

    if (fuel.supplierType !== 'Rebrand') {
      logger.warn(
        `[fuelChanges] attempted to save non-Rebrand fuel ${fuelId}: ${fuel.supplierType}`
      )
      return h.redirect(fuelDetailsHref)
    }

    if (!validation.isValid) {
      return renderFuelChangesPage(
        h,
        fuelId,
        fuel,
        validation.values,
        validation.errorList[0]
      ).code(statusCodes.badRequest)
    }

    await saveFuelChanges(
      fuelId,
      validation.values.hasFuelChanges,
      validation.values.changes
    )

    return h.redirect(fuelDetailsHref)
  } catch (error) {
    logger.error(`[fuelChanges] failed to save ${fuelId}: ${error.message}`)

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const fuelChangesController = {
  handler: handleFuelChangesRequest
}

const fuelChangesDecisionController = {
  handler: handleFuelChangesDecisionRequest
}

export {
  handleFuelChangesRequest,
  handleFuelChangesDecisionRequest,
  fuelChangesController,
  fuelChangesDecisionController
}
