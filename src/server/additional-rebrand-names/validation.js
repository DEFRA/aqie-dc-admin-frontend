import { additionalRebrandNamesContent } from './content.js'

const content = additionalRebrandNamesContent.en

export function normaliseAdditionalBrandNamesValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value ?? ''
}

export function getAdditionalRebrandNamesValues(fuel = {}) {
  const additionalBrandNamesValue = normaliseAdditionalBrandNamesValue(
    fuel.additionalBrandNames
  )

  return {
    hasAdditionalBrandNames: Boolean(additionalBrandNamesValue.trim()),
    additionalBrandNames: additionalBrandNamesValue
  }
}

export function validateAdditionalRebrandNames(payload = {}) {
  const addBrands = payload.addBrands
  const additionalBrandsValue = payload.additionalBrands ?? ''
  const trimmed = additionalBrandsValue.trim()
  const isAdditionalBrandNamesSelected = addBrands === 'Yes'

  if (isAdditionalBrandNamesSelected && !trimmed) {
    const error = {
      field: 'additionalBrands',
      message: content.errors.additionalBrandsRequired,
      href: '#additional-brands'
    }

    return {
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: additionalBrandsValue
      },
      errors: {
        additionalBrands: error.message
      },
      errorList: [error],
      isValid: false
    }
  }

  return {
    values: {
      hasAdditionalBrandNames: isAdditionalBrandNamesSelected,
      additionalBrandNames: additionalBrandsValue
    },
    errors: {},
    errorList: [],
    isValid: true
  }
}
