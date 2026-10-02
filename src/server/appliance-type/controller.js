import { applianceTypeContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForApplianceType,
  saveApplianceType,
  getApplianceTypes
} from './appliance-type-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceTypeContent.en

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
    id: `applianceType-${type.value.replace(/\s+/g, '-').toLowerCase()}`
  }))
}

function renderApplianceTypePage(
  h,
  applianceId,
  appliance,
  selectedType,
  error,
  applianceTypeItems
) {
  const heading = content.heading(appliance.modelName)
  const applianceDetailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`

  return h.view('appliance-type/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    selectedType,
    error,
    applianceDetailsHref,
    applianceTypeItems
  })
}

async function handleApplianceTypeRequest(request, h) {
  const { applianceId } = request.params

  try {
    logger.info(`[applianceType] loading appliance ${applianceId}`)

    // Fetch appliance data and appliance types in parallel
    const [response, applianceTypesResponse] = await Promise.all([
      getApplianceForApplianceType(applianceId),
      getApplianceTypes(true) // true = only primary types
    ])

    if (!response) {
      throw new Error('API returned empty response')
    }

    const { data: appliance } = response

    if (!appliance) {
      throw new Error('API response missing data field')
    }

    // Transform appliance types to radio button items
    const applianceTypeItems = transformToRadioItems(
      applianceTypesResponse,
      appliance.applianceType
    )

    return renderApplianceTypePage(
      h,
      applianceId,
      appliance,
      appliance.applianceType ?? '',
      null,
      applianceTypeItems
    )
  } catch (error) {
    logger.error(
      `[applianceType] failed to load ${applianceId}: ${error.message}`,
      { error }
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleApplianceTypeDecisionRequest(request, h) {
  const { applianceId } = request.params
  const detailsHref = `/review-appliance/${encodeURIComponent(applianceId)}/appliance-details`
  const { applianceType } = request.payload

  try {
    const [applianceResponse, applianceTypesResponse] = await Promise.all([
      getApplianceForApplianceType(applianceId),
      getApplianceTypes(true)
    ])

    const { data: appliance } = applianceResponse || {}
    const validApplianceTypes = (applianceTypesResponse || []).map(
      (type) => type.value
    )

    if (!applianceType || !validApplianceTypes.includes(applianceType)) {
      const applianceTypeItems = transformToRadioItems(applianceTypesResponse)

      return renderApplianceTypePage(
        h,
        applianceId,
        appliance,
        applianceType ?? '',
        {
          field: 'applianceType',
          message: content.errors.applianceTypeRequired,
          href: '#appliance-type'
        },
        applianceTypeItems
      ).code(statusCodes.badRequest)
    }

    await saveApplianceType(applianceId, applianceType)

    return h.redirect(detailsHref)
  } catch (error) {
    logger.error(
      `[applianceType] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const applianceTypeController = {
  handler: handleApplianceTypeRequest
}

const applianceTypeDecisionController = {
  handler: handleApplianceTypeDecisionRequest
}

export {
  handleApplianceTypeRequest,
  handleApplianceTypeDecisionRequest,
  applianceTypeController,
  applianceTypeDecisionController
}
