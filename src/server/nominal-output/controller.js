import { nominalOutputContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForNominalOutput,
  saveNominalOutput
} from './nominal-output-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = nominalOutputContent.en
const MAX_KW = 1000

function renderPage(h, applianceId, appliance, formValue, error) {
  const heading = content.heading(appliance.modelName)

  return h.view('nominal-output/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    applianceDetailsHref: `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`,
    formValue,
    error
  })
}

async function handleGet(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForNominalOutput(applianceId)

    return renderPage(
      h,
      applianceId,
      appliance,
      appliance.nominalOutput ?? '',
      null
    )
  } catch (error) {
    logger.error(
      `[nominalOutput] GET failed for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handlePost(request, h) {
  const { applianceId } = request.params
  const { nominalOutput } = request.payload
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  const trimmed = nominalOutput.trim()
  const parsed = parseFloat(trimmed)
  const isEmpty = trimmed === '' || isNaN(parsed)
  const isTooHigh = !isEmpty && parsed >= MAX_KW

  if (isEmpty || isTooHigh) {
    try {
      const { data: appliance } =
        await getApplianceForNominalOutput(applianceId)

      return renderPage(h, applianceId, appliance, nominalOutput, {
        message: isEmpty ? content.errors.required : content.errors.tooHigh,
        href: '#nominal-output'
      }).code(statusCodes.badRequest)
    } catch (error) {
      logger.error(
        `[nominalOutput] POST fetch failed for ${applianceId}: ${error.message}`
      )

      return h
        .view('error/index', { message: content.errors.generic })
        .code(statusCodes.internalServerError)
    }
  }

  try {
    await saveNominalOutput(applianceId, parsed)

    return h.redirect(applianceDetailsHref)
  } catch (error) {
    logger.error(
      `[nominalOutput] save failed for ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const nominalOutputController = { handler: handleGet }
export const nominalOutputSaveController = { handler: handlePost }
