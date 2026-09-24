import { checkApplianceDetailsContent } from './content.js'

const content = checkApplianceDetailsContent.en

export function formatBoolean(value) {
  if (value === true) {
    return 'Yes'
  }

  if (value === false) {
    return 'No'
  }

  return content.notProvided
}

export function formatApplianceType(value) {
  if (!value) {
    return content.notProvided
  }

  return `${value}`.charAt(0).toUpperCase() + `${value}`.slice(1)
}

export function formatNominalOutput(value) {
  if (value === undefined || value === null || value === '') {
    return content.notProvided
  }

  return `${value} kW`
}

export function valueText(value) {
  if (value === undefined || value === null || value === '') {
    return content.notProvided
  }

  return `${value}`
}

export function buildSummaryItems(appliance) {
  const modelNumberValue = valueText(appliance.modelNumber)
  const hasModelNumber = modelNumberValue !== content.notProvided
  const isOtherApplianceType =
    appliance.applianceType && appliance.applianceType.toLowerCase() === 'other'
  const isVariant = appliance.isVariant === true
  const variantDetailsValue = valueText(appliance.existingAuthorisedAppliance)
  const hasVariantDetails = variantDetailsValue !== content.notProvided

  const items = [
    {
      key: { text: content.labels.modelName },
      value: { text: valueText(appliance.modelName) },
      actions: {
        items: [
          {
            href: 'model-name',
            text: content.actions.change,
            visuallyHiddenText: 'model name'
          }
        ]
      }
    },
    {
      key: { text: content.labels.modelNumber },
      value: { text: modelNumberValue },
      actions: {
        items: [
          {
            href: 'model-number',
            text: hasModelNumber ? content.actions.change : content.actions.add,
            visuallyHiddenText: 'model number'
          }
        ]
      }
    },
    {
      key: { text: content.labels.applianceType },
      value: { text: formatApplianceType(appliance.applianceType) },
      actions: {
        items: [
          {
            href: 'appliance-type',
            text: content.actions.change,
            visuallyHiddenText: 'appliance type'
          }
        ]
      }
    }
  ]

  // Conditionally add "Other appliance type" row if type is "other"
  if (isOtherApplianceType) {
    items.push({
      key: { text: content.labels.otherApplianceType },
      value: {
        html: `<a class="govuk-link" href="appliance-type-other">${content.actions.select}<span class="govuk-visually-hidden"> other appliance type</span></a>`
      }
    })
  }

  items.push({
    key: { text: content.labels.isVariant },
    value: { text: formatBoolean(appliance.isVariant) },
    actions: {
      items: [
        {
          href: 'variant-appliance',
          text: content.actions.change,
          visuallyHiddenText: 'if this is a variant'
        }
      ]
    }
  })

  // Conditionally add "Variant details" row if isVariant is true
  if (isVariant) {
    items.push({
      key: { text: content.labels.variantDetails },
      value: {
        text: hasVariantDetails ? variantDetailsValue : content.notProvided
      },
      actions: hasVariantDetails
        ? {
            items: [
              {
                href: 'variant-appliance',
                text: content.actions.change,
                visuallyHiddenText: 'variant details'
              }
            ]
          }
        : undefined
    })
  }

  items.push(
    {
      key: { text: content.labels.nominalOutput },
      value: { text: formatNominalOutput(appliance.nominalOutput) },
      actions: {
        items: [
          {
            href: 'thermal-output',
            text: content.actions.change,
            visuallyHiddenText: 'nominal thermal output'
          }
        ]
      }
    },
    {
      key: { text: content.labels.multifuelAppliance },
      value: { text: formatBoolean(appliance.multifuelAppliance) },
      actions: {
        items: [
          {
            href: 'multi-fuel',
            text: content.actions.change,
            visuallyHiddenText: 'if the appliance is multifuel'
          }
        ]
      }
    }
  )

  return items
}
