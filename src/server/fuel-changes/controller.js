import { fuelChangesContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getFuelForFuelChanges, saveFuelChanges } from './fuel-changes-data.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { getFuelChangesValues, validateFuelChanges } from './validation.js'

const logger = createLogger()
const content = fuelChangesContent.en

function renderFuelChangesPage(h, fuelId, fuel, formData, error) {
  const heading = content.heading
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const action = `/fuel-changes/${encodeURIComponent(fuelId)}`

  const formValues = formData ?? getFuelChangesValues(fuel)
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
  const fuelDetailsHref = `/review-fuel/${encodeURIComponent(fuelId)}/fuel-details`
  const payload = request.payload ?? {}
  const validation = validateFuelChanges(payload)

  try {
    if (!validation.isValid) {
      const { data: fuel } = await getFuelForFuelChanges(fuelId)

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
      validation.values.hasFuelChanges ? validation.values.changes.trim() : null
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
