import { variantApplianceContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForVariant,
  saveVariantAppliance
} from './variant-appliance-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = variantApplianceContent.en
const MAX_VARIANT_DETAILS_LENGTH = 1000

function renderVariantAppliancePage(
  h,
  applianceId,
  appliance,
  formData,
  error
) {
  const heading = content.heading(appliance.modelName)
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  const isVariant =
    formData?.isVariantCS === 'Yes' ||
    (formData?.isVariantCS === undefined && appliance.isVariant === true)
  const variantDetailsValue =
    formData?.variantDetailsCS ?? appliance.existingAuthorisedAppliance ?? ''

  return h.view('variant-appliance/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    isVariant,
    variantDetailsValue,
    error,
    applianceDetailsHref
  })
}

async function handleVariantApplianceRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForVariant(applianceId)

    return renderVariantAppliancePage(h, applianceId, appliance, null, null)
  } catch (error) {
    logger.error(
      `[variant-appliance] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleVariantApplianceDecisionRequest(request, h) {
  const { applianceId } = request.params
  const detailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const { isVariantCS, variantDetailsCS } = request.payload
  const isVariant = isVariantCS === 'Yes'
  const variantDetailsValue = variantDetailsCS ?? ''
  const trimmed = variantDetailsValue.trim()

  try {
    if (isVariant && !trimmed) {
      const { data: appliance } = await getApplianceForVariant(applianceId)

      return renderVariantAppliancePage(
        h,
        applianceId,
        appliance,
        { isVariantCS, variantDetailsCS },
        {
          field: 'variantDetailsCS',
          message: content.errors.detailsRequired,
          href: '#variant-details'
        }
      ).code(statusCodes.badRequest)
    }

    if (isVariant && trimmed.length > MAX_VARIANT_DETAILS_LENGTH) {
      const { data: appliance } = await getApplianceForVariant(applianceId)
      const charsOver = trimmed.length - MAX_VARIANT_DETAILS_LENGTH

      return renderVariantAppliancePage(
        h,
        applianceId,
        appliance,
        { isVariantCS, variantDetailsCS },
        {
          field: 'variantDetailsCS',
          message: content.errors.detailsMaxLength(charsOver),
          href: '#variant-details'
        }
      ).code(statusCodes.badRequest)
    }

    await saveVariantAppliance(
      applianceId,
      isVariant,
      isVariant ? trimmed : null
    )

    return h.redirect(detailsHref)
  } catch (error) {
    logger.error(
      `[variant-appliance] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const variantApplianceController = {
  handler: handleVariantApplianceRequest
}

const variantApplianceDecisionController = {
  handler: handleVariantApplianceDecisionRequest
}

export {
  handleVariantApplianceRequest,
  handleVariantApplianceDecisionRequest,
  variantApplianceController,
  variantApplianceDecisionController
}
