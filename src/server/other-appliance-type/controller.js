import { otherApplianceTypeContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForOtherType,
  saveOtherApplianceType,
  getSecondaryApplianceTypes
} from './other-appliance-type-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = otherApplianceTypeContent.en

/**
 * Transform appliance types to radio button items format
 * @param {Array} applianceTypes - Array of appliance type objects from API
 * @param {string} checkedValue - The value that should be checked/selected
 * @returns {Array} Formatted items for govukRadios macro
 */
function transformToRadioItems(applianceTypes, checkedValue = null) {
  return (applianceTypes || []).map((type) => ({
    value: type.value,
    text: type.value,
    checked: checkedValue === type.value,
    id: `otherApplianceType-${type.value.replace(/\s+/g, '-').toLowerCase()}`
  }))
}

function renderOtherApplianceTypePage(
  h,
  applianceId,
  appliance,
  selectedType,
  error,
  otherApplianceTypeItems
) {
  const heading = content.heading(appliance.modelName)
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  return h.view('other-appliance-type/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    selectedType,
    error,
    applianceDetailsHref,
    otherApplianceTypeItems
  })
}

async function handleOtherApplianceTypeRequest(request, h) {
  const { applianceId } = request.params

  try {
    logger.info(`[otherApplianceType] loading appliance ${applianceId}`)

    // Fetch appliance data and secondary appliance types in parallel
    const [response, secondaryTypesResponse] = await Promise.all([
      getApplianceForOtherType(applianceId),
      getSecondaryApplianceTypes()
    ])

    if (!response) {
      throw new Error('API returned empty response')
    }

    const { data: appliance } = response

    if (!appliance) {
      throw new Error('API response missing data field')
    }

    // Transform appliance types to radio button items
    const otherApplianceTypeItems = transformToRadioItems(
      secondaryTypesResponse,
      appliance.otherApplianceType
    )

    return renderOtherApplianceTypePage(
      h,
      applianceId,
      appliance,
      appliance.otherApplianceType ?? '',
      null,
      otherApplianceTypeItems
    )
  } catch (error) {
    logger.error(
      `[otherApplianceType] failed to load ${applianceId}: ${error.message}`,
      { error }
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleOtherApplianceTypeDecisionRequest(request, h) {
  const { applianceId } = request.params
  const detailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const { otherApplianceType } = request.payload

  try {
    const [applianceResponse, secondaryTypesResponse] = await Promise.all([
      getApplianceForOtherType(applianceId),
      getSecondaryApplianceTypes()
    ])

    const { data: appliance } = applianceResponse || {}
    const validOtherApplianceTypes = (secondaryTypesResponse || []).map(
      (type) => type.value
    )

    if (
      !otherApplianceType ||
      !validOtherApplianceTypes.includes(otherApplianceType)
    ) {
      const otherApplianceTypeItems = transformToRadioItems(
        secondaryTypesResponse,
        otherApplianceType ?? ''
      )

      return renderOtherApplianceTypePage(
        h,
        applianceId,
        appliance,
        otherApplianceType ?? '',
        {
          field: 'otherApplianceType',
          message: content.errors.otherApplianceTypeRequired,
          href: '#other-appliance-type'
        },
        otherApplianceTypeItems
      ).code(statusCodes.badRequest)
    }

    await saveOtherApplianceType(applianceId, otherApplianceType)

    return h.redirect(detailsHref)
  } catch (error) {
    logger.error(
      `[otherApplianceType] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const otherApplianceTypeController = {
  handler: handleOtherApplianceTypeRequest
}

const otherApplianceTypeDecisionController = {
  handler: handleOtherApplianceTypeDecisionRequest
}

export {
  handleOtherApplianceTypeRequest,
  handleOtherApplianceTypeDecisionRequest,
  otherApplianceTypeController,
  otherApplianceTypeDecisionController
}
