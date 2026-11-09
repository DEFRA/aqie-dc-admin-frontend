import { fuelDetailsContent } from './content.js'

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
      ...changeAction(`/brand-name/${encoded}`, 'brand name')
    },
    {
      key: { text: labels.additionalBrandNamesQuestion },
      value: {
        text: buildAdditionalBrandNamesValue(fuel.additionalBrandNames)
      },
      ...changeAction(
        `/additional-brand-names/${encoded}`,
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
        `/additional-brand-names/${encoded}`,
        'additional brand names'
      )
    })
  }

  rows.push(
    {
      key: { text: labels.fuelAppearance },
      value: {
        text: fuel.fuelDescription?.appearance ?? content.notProvided
      },
      ...changeAction(`/fuel-appearance/${encoded}`, 'fuel appearance')
    },
    {
      key: { text: labels.fuelWeight },
      value: { text: fuel.fuelDescription?.weight ?? content.notProvided },
      ...changeAction(`/fuel-weight/${encoded}`, 'fuel weight')
    },
    {
      key: { text: labels.fuelComposition },
      value: {
        text: fuel.fuelDescription?.composition ?? content.notProvided
      },
      ...changeAction(`/fuel-composition/${encoded}`, 'fuel composition')
    },
    {
      key: { text: labels.sulphurContent },
      value: {
        text: fuel.fuelDescription.sulphurContent ?? content.notProvided
      },
      ...changeAction(`/sulphur-content/${encoded}`, 'sulphur content')
    },
    {
      key: { text: labels.manufacturingProcess },
      value: { text: fuel.manufacturingProcess ?? content.notProvided },
      ...changeAction(
        `/manufacturing-process/${encoded}`,
        'manufacturing process'
      )
    },
    {
      key: { text: labels.hasQualityControlSystem },
      value: { text: buildBooleanValue(fuel.hasQualityControlSystem) },
      ...changeAction(
        `/monitored-quality-control/${encoded}`,
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
        `/original-fuel-manufacturer/${encoded}`,
        'original fuel manufacturer'
      )
    },
    {
      key: { text: labels.originalFuelName },
      value: { text: fuel.originalFuel?.name ?? content.notProvided },
      ...changeAction(
        `/original-fuel-name/${encoded}`,
        'original fuel name or brand'
      )
    },
    {
      key: { text: labels.isChangedOrMixed },
      value: { text: buildBooleanValue(fuel.originalFuel?.isChangedOrMixed) },
      ...changeAction(
        `/changes-made-to-original-fuel/${encoded}`,
        'changes made to original fuel'
      )
    }
  )

  if (fuel.originalFuel?.isChangedOrMixed === true) {
    rows.push({
      key: { text: labels.changes },
      value: { text: fuel.originalFuel?.changes ?? content.notProvided },
      ...changeAction(`/detail-of-changes/${encoded}`, 'detail of changes')
    })
  }

  return rows
}
