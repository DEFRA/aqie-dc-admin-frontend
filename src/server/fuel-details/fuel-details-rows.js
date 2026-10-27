import { fuelDetailsContent } from './content.js'

const content = fuelDetailsContent.en

function buildBooleanValue(value) {
  if (typeof value === 'boolean') {
    return value ? content.boolean.yes : content.boolean.no
  }

  return content.notProvided
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

  const rows = [
    {
      key: { text: labels.brandName },
      value: { text: fuel.brandName ?? content.notProvided },
      ...changeAction(`/brand-name/${encoded}`, 'brand name')
    },
    {
      key: { text: labels.additionalBrandNamesQuestion },
      value: { text: buildBooleanValue(fuel.additionalBrandNames) },
      ...changeAction(
        `/additional-brand-names/${encoded}`,
        'will the fuel be sold under any additional brand names'
      )
    }
  ]

  if (fuel.additionalBrandNames === true) {
    const additionalNames = Array.isArray(fuel.additionalBrandNamesList)
      ? fuel.additionalBrandNamesList.join(', ')
      : (fuel.additionalBrandNamesList ?? content.notProvided)

    rows.push({
      key: { text: labels.additionalBrandNames },
      value: { text: additionalNames },
      ...changeAction(
        `/additional-brand-names/${encoded}`,
        'additional brand names'
      )
    })
  }

  rows.push(
    {
      key: { text: labels.fuelAppearance },
      value: { text: fuel.fuelAppearance ?? content.notProvided },
      ...changeAction(`/fuel-appearance/${encoded}`, 'fuel appearance')
    },
    {
      key: { text: labels.fuelWeight },
      value: { text: fuel.fuelWeight ?? content.notProvided },
      ...changeAction(`/fuel-weight/${encoded}`, 'fuel weight')
    },
    {
      key: { text: labels.fuelComposition },
      value: { text: fuel.fuelComposition ?? content.notProvided },
      ...changeAction(`/fuel-composition/${encoded}`, 'fuel composition')
    },
    {
      key: { text: labels.sulphurContent },
      value: { text: fuel.sulphurContent ?? content.notProvided },
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
      key: { text: labels.monitoredQualityControlSystem },
      value: { text: buildBooleanValue(fuel.monitoredQualityControlSystem) },
      ...changeAction(
        `/monitored-quality-control/${encoded}`,
        'monitored quality control system'
      )
    }
  )

  return rows
}

export function buildResellerFuelDetailsRows(fuel, fuelId) {
  const labels = content.resellerLabels
  const encoded = encodeURIComponent(fuelId)

  const rows = [
    {
      key: { text: labels.rebrandedName },
      value: { text: fuel.rebrandedName ?? content.notProvided },
      ...changeAction(`/rebranded-name/${encoded}`, 'rebranded name')
    },
    {
      key: { text: labels.additionalRebrandNamesQuestion },
      value: { text: buildBooleanValue(fuel.additionalRebrandNames) },
      ...changeAction(
        `/additional-rebrand-names/${encoded}`,
        'will the fuel be sold under any additional rebrand names'
      )
    }
  ]

  if (fuel.additionalRebrandNames === true) {
    const additionalNames = Array.isArray(fuel.additionalRebrandNamesList)
      ? fuel.additionalRebrandNamesList.join(', ')
      : (fuel.additionalRebrandNamesList ?? content.notProvided)

    rows.push({
      key: { text: labels.additionalRebrandNames },
      value: { text: additionalNames },
      ...changeAction(
        `/additional-rebrand-names/${encoded}`,
        'additional rebrand names'
      )
    })
  }

  rows.push(
    {
      key: { text: labels.originalFuelManufacturer },
      value: { text: fuel.originalFuelManufacturer ?? content.notProvided },
      ...changeAction(
        `/original-fuel-manufacturer/${encoded}`,
        'original fuel manufacturer'
      )
    },
    {
      key: { text: labels.originalFuelNameOrBrand },
      value: { text: fuel.originalFuelNameOrBrand ?? content.notProvided },
      ...changeAction(
        `/original-fuel-name-or-brand/${encoded}`,
        'original fuel name or brand'
      )
    },
    {
      key: { text: labels.changesMadeToOriginalFuel },
      value: { text: buildBooleanValue(fuel.changesMadeToOriginalFuel) },
      ...changeAction(
        `/changes-made-to-original-fuel/${encoded}`,
        'changes made to original fuel'
      )
    }
  )

  if (fuel.changesMadeToOriginalFuel === true) {
    rows.push({
      key: { text: labels.detailOfChanges },
      value: { text: fuel.detailOfChanges ?? content.notProvided },
      ...changeAction(
        `/changes-made-to-original-fuel/${encoded}`,
        'detail of changes'
      )
    })
  }

  return rows
}
