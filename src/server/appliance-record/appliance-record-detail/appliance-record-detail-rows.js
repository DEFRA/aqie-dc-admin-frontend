import {
  formatBoolean,
  formatApplianceType,
  formatNominalOutput,
  valueText
} from '../../appliance-details/appliance-summary-builder.js'
import { applianceRecordDetailContent } from './content.js'

const content = applianceRecordDetailContent.en

/**
 * Builds the govukSummaryList value object for permitted fuels.
 * Single fuel → plain text. Multiple fuels → bullet list.
 */
export function buildPermittedFuelsValue(fuels) {
  if (!fuels) return { text: content.notProvided }

  const fuelsArray = Array.isArray(fuels) ? fuels : [fuels]

  if (fuelsArray.length === 1) {
    return { text: fuelsArray[0] }
  }

  const items = fuelsArray.map((f) => `<li>${f}</li>`).join('')
  return {
    html: `<ul class="govuk-list govuk-list--bullet">${items}</ul>`
  }
}

export function buildNonLegacyRows(appliance) {
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

export function buildLegacyRows(appliance) {
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
