import { applianceRecordDetailContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceDetail } from './appliance-record-detail-data.js'
import {
  formatBoolean,
  formatApplianceType,
  formatNominalOutput,
  valueText
} from '../appliance-details/appliance-summary-builder.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceRecordDetailContent.en

/**
 * Builds the govukSummaryList value object for permitted fuels.
 * Single fuel → plain text. Multiple fuels → bullet list.
 */
function buildPermittedFuelsValue(fuels) {
  if (!fuels) return { text: content.notProvided }

  const fuelsArray = Array.isArray(fuels) ? fuels : [fuels]

  if (fuelsArray.length === 1) {
    return { text: fuelsArray[0] }
  }

  return {
    html: `<ul class="govuk-list govuk-list--bullet">${fuelsArray.map((f) => `<li>${f}</li>`).join('')}</ul>`
  }
}

function buildNonLegacyRows(appliance) {
  const isOtherType = appliance.applianceType?.toLowerCase() === 'other'
  const isVariant = appliance.isVariant === true

  const rows = [
    {
      key: { text: content.labels.applianceId },
      value: { text: valueText(appliance.id) }
    },
    {
      key: { text: content.labels.modelName },
      value: { text: valueText(appliance.modelName) }
    },
    {
      key: { text: content.labels.modelNumber },
      value: { text: valueText(appliance.modelNumber) }
    },
    {
      key: { text: content.labels.applianceType },
      value: { text: formatApplianceType(appliance.applianceType) }
    }
  ]

  if (isOtherType) {
    rows.push({
      key: { text: content.labels.otherApplianceType },
      value: { text: valueText(appliance.otherApplianceType) }
    })
  }

  rows.push({
    key: { text: content.labels.isVariant },
    value: { text: formatBoolean(appliance.isVariant) }
  })

  if (isVariant) {
    rows.push({
      key: { text: content.labels.variantDetails },
      value: { text: valueText(appliance.existingAuthorisedAppliance) }
    })
  }

  rows.push(
    {
      key: { text: content.labels.nominalOutput },
      value: { text: formatNominalOutput(appliance.nominalOutput) }
    },
    {
      key: { text: content.labels.permittedFuels },
      value: buildPermittedFuelsValue(appliance.permittedFuels)
    },
    {
      key: { text: content.labels.additionalConditions },
      value: { text: valueText(appliance.additionalConditions) }
    }
  )

  return rows
}

function buildLegacyRows(appliance) {
  return [
    {
      key: { text: content.labels.legacyApplianceId },
      value: { text: valueText(appliance.id) }
    },
    {
      key: { text: content.labels.modelName },
      value: { text: valueText(appliance.modelName) }
    },
    {
      key: { text: content.labels.modelNumber },
      value: { text: valueText(appliance.modelNumber) }
    },
    {
      key: { text: content.labels.applianceType },
      value: { text: formatApplianceType(appliance.applianceType) }
    },
    {
      key: { text: content.labels.nominalOutput },
      value: { text: formatNominalOutput(appliance.nominalOutput) }
    },
    {
      key: { text: content.labels.multifuelAppliance },
      value: { text: formatBoolean(appliance.multifuelAppliance) }
    },
    {
      key: { text: content.labels.permittedFuels },
      value: buildPermittedFuelsValue(appliance.permittedFuels)
    },
    {
      key: { text: content.labels.permittedToBurnWood },
      value: { text: formatBoolean(appliance.permittedToBurnWood) }
    },
    {
      key: { text: content.labels.additionalConditions },
      value: { text: valueText(appliance.additionalConditions) }
    }
  ]
}

function buildViewModel(appliance, applianceId) {
  const returnHref = `/manage-certification/appliance-record/${encodeURIComponent(applianceId)}`

  return {
    pageTitle: content.pageTitle,
    heading: content.heading,
    summaryRows: appliance.isLegacyRecord
      ? buildLegacyRows(appliance)
      : buildNonLegacyRows(appliance),
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      {
        text: 'Appliance records',
        href: '/manage-certification/appliance-record'
      },
      { text: appliance.modelName, href: returnHref }
    ]
  }
}

async function handleApplianceRecordDetailRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceDetail(applianceId)

    return h.view(
      'appliance-record-detail/index',
      buildViewModel(appliance, applianceId)
    )
  } catch (error) {
    logger.error(
      `[applianceRecordDetail] failed to load ${applianceId}: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const applianceRecordDetailController = {
  handler: handleApplianceRecordDetailRequest
}

export { handleApplianceRecordDetailRequest }
