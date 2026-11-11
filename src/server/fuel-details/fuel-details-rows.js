import { fuelDetailsContent } from './content.js'
import {
  FUEL_DESCRIPTION_FIELDS,
  getFuelDescriptionFieldHref
} from '../common/helpers/fuel-description-fields.js'

const content = fuelDetailsContent.en

function buildBooleanValue(value) {
  if (typeof value === 'boolean') {
    return value ? content.boolean.yes : content.boolean.no
  }

  return content.notProvided
}

function buildAdditionalBrandNamesValue(additionalBrandNames) {
  if (typeof additionalBrandNames === 'string') {
    return additionalBrandNames.trim()
      ? content.boolean.yes
      : content.boolean.no
  }

  if (Array.isArray(additionalBrandNames) && additionalBrandNames.length > 0) {
    return content.boolean.yes
  }

  return content.boolean.no
}

function formatAdditionalBrandNamesValue(additionalBrandNames) {
  if (Array.isArray(additionalBrandNames)) {
    return additionalBrandNames.join(', ')
  }

  return additionalBrandNames ?? ''
}

function changeAction(href, visuallyHiddenText) {
  return {
    actions: {
      items: [
        {
          href,
          text: content.actions.change,
          visuallyHiddenText
        }
      ]
    }
  }
}

export function buildManufacturerFuelDetailsRows(fuel, fuelId) {
  const labels = content.manufacturerLabels
  const encoded = encodeURIComponent(fuelId)
  const hasAdditionalNames =
    (typeof fuel.additionalBrandNames === 'string' &&
      fuel.additionalBrandNames.trim().length > 0) ||
    (Array.isArray(fuel.additionalBrandNames) &&
      fuel.additionalBrandNames.length > 0)

  const rows = [
    {
      key: { text: labels.brandName },
      value: { text: fuel.name ?? content.notProvided },
      ...changeAction(`/review-fuel/${encoded}/brand-name`, 'brand name')
    },
    {
      key: { text: labels.additionalBrandNamesQuestion },
      value: {
        text: buildAdditionalBrandNamesValue(fuel.additionalBrandNames)
      },
      ...changeAction(
        `/review-fuel/${encoded}/additional-brand-names`,
        'will the fuel be sold under any additional brand names'
      )
    }
  ]

  if (hasAdditionalNames) {
    rows.push({
      key: { text: labels.additionalBrandNames },
      value: {
        text: formatAdditionalBrandNamesValue(fuel.additionalBrandNames)
      },
      ...changeAction(
        `/review-fuel/${encoded}/additional-brand-names`,
        'additional brand names'
      )
    })
  }

  rows.push(
    ...FUEL_DESCRIPTION_FIELDS.map((field) => ({
      key: { text: labels[field.labelKey] },
      value: { text: field.getValue(fuel) ?? content.notProvided },
      ...changeAction(
        getFuelDescriptionFieldHref(field, fuelId),
        labels[field.labelKey].toLowerCase()
      )
    })),
    {
      key: { text: labels.hasQualityControlSystem },
      value: { text: buildBooleanValue(fuel.hasQualityControlSystem) },
      ...changeAction(
        `/review-fuel/${encoded}/quality-control`,
        'monitored quality control system'
      )
    }
  )

  return rows
}

export function buildRebranderFuelDetailsRows(fuel, fuelId) {
  const labels = content.rebranderLabels
  const encoded = encodeURIComponent(fuelId)
  const hasAdditionalNames =
    (typeof fuel.additionalBrandNames === 'string' &&
      fuel.additionalBrandNames.trim().length > 0) ||
    (Array.isArray(fuel.additionalBrandNames) &&
      fuel.additionalBrandNames.length > 0)

  const rows = [
    {
      key: { text: labels.brandName },
      value: { text: fuel.name ?? content.notProvided },
      ...changeAction(`/rebrand-name/${encoded}`, 'brand name')
    },
    {
      key: { text: labels.additionalBrandNamesQuestion },
      value: {
        text: buildAdditionalBrandNamesValue(fuel.additionalBrandNames)
      },
      ...changeAction(
        `/additional-rebrand-names/${encoded}`,
        'will the fuel be sold under any additional rebrand names'
      )
    }
  ]

  if (hasAdditionalNames) {
    rows.push({
      key: { text: labels.additionalBrandNames },
      value: {
        text: formatAdditionalBrandNamesValue(fuel.additionalBrandNames)
      },
      ...changeAction(
        `/additional-rebrand-names/${encoded}`,
        'additional rebrand names'
      )
    })
  }

  rows.push(
    {
      key: { text: labels.originalFuelManufacturer },
      value: {
        text: fuel.originalFuel?.manufacturer ?? content.notProvided
      },
      ...changeAction(
        `/original-manufacturer/${encoded}`,
        'original fuel manufacturer'
      )
    },
    {
      key: { text: labels.originalFuelName },
      value: { text: fuel.originalFuel?.name ?? content.notProvided },
      ...changeAction(
        `/original-brand/${encoded}`,
        'original fuel name or brand'
      )
    },
    {
      key: { text: labels.isChangedOrMixed },
      value: { text: buildBooleanValue(fuel.originalFuel?.isChangedOrMixed) },
      ...changeAction(
        `/fuel-changes/${encoded}`,
        'changes made to original fuel'
      )
    }
  )

  if (fuel.originalFuel?.isChangedOrMixed === true) {
    rows.push({
      key: { text: labels.changes },
      value: { text: fuel.originalFuel?.changes ?? content.notProvided },
      ...changeAction(`/fuel-changes/${encoded}`, 'detail of changes')
    })
  }

  return rows
}
