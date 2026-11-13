import { additionalBrandNamesContent } from './content.js'

const content = additionalBrandNamesContent.en

export function getAdditionalBrandNamesValues(fuel = {}) {
  const additionalBrandNamesValue = fuel.additionalBrandNames ?? ''

  return {
    hasAdditionalBrandNames:
      typeof additionalBrandNamesValue === 'string' &&
      additionalBrandNamesValue.trim().length > 0,
    additionalBrandNames: additionalBrandNamesValue
  }
}

export function validateAdditionalBrandNames(payload = {}) {
  const addBrands = payload.addBrands
  // Accept both field names since both routes use the same payload schema
  const additionalBrandsValue =
    payload.additionalBrands ?? payload.additionalRebrandBrands ?? ''
  const trimmed = additionalBrandsValue.trim()
  const isAdditionalBrandNamesSelected = addBrands === 'Yes'

  // Determine which field was used so we can return correct error href
  const fieldName =
    typeof payload.additionalRebrandBrands === 'string'
      ? 'additionalRebrandBrands'
      : 'additionalBrands'

  if (isAdditionalBrandNamesSelected && !trimmed) {
    const error = {
      field: fieldName,
      message: content.rebrand.brandsRequired,
      href: `#${fieldName === 'additionalRebrandBrands' ? 'additional-rebrand-brands' : 'additional-brands'}`
    }

    return {
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: additionalBrandsValue
      },
      errors: {
        [fieldName]: error.message
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
