import { multifuelApplianceContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForMultifuel,
  saveMultifuelAppliance
} from './multifuel-appliance-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = multifuelApplianceContent.en

function toYesNo(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return undefined
}

function renderPage(h, applianceId, appliance, formValue, error) {
  const heading = content.heading(appliance.modelName)

  return h.view('multifuel-appliance/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    formAction: `/review-appliance/${encodeURIComponent(applianceId)}/multifuel-appliance`,
    applianceDetailsHref: `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`,
    formValue,
    error
  })
}

async function handleGet(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForMultifuel(applianceId)

    return renderPage(
      h,
      applianceId,
      appliance,
      toYesNo(appliance.multifuelAppliance),
      null
    )
  } catch (error) {
    logger.error(
      `[multifuelAppliance] GET failed for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handlePost(request, h) {
  const { applianceId } = request.params
  const { multifuelAppliance } = request.payload
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  if (!multifuelAppliance) {
    try {
      const { data: appliance } = await getApplianceForMultifuel(applianceId)

      return renderPage(h, applianceId, appliance, undefined, {
        field: 'multifuelAppliance',
        message: content.errors.selectionRequired,
        href: '#multifuelAppliance'
      }).code(statusCodes.badRequest)
    } catch (error) {
      logger.error(
        `[multifuelAppliance] POST fetch failed for ${applianceId}: ${error.message}`
      )

      return h
        .view('error/index', { message: content.errors.generic })
        .code(statusCodes.internalServerError)
    }
  }

  try {
    await saveMultifuelAppliance(applianceId, multifuelAppliance === 'Yes')

    return h.redirect(applianceDetailsHref)
  } catch (error) {
    logger.error(
      `[multifuelAppliance] save failed for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const multifuelApplianceController = { handler: handleGet }
export const multifuelApplianceSaveController = { handler: handlePost }

export { handleGet, handlePost }
