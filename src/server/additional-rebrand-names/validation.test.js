import { describe, expect, test } from 'vitest'

import {
  getAdditionalRebrandNamesValues,
  validateAdditionalRebrandNames
} from './validation.js'

describe('getAdditionalRebrandNamesValues', () => {
  test('maps a saved string value into the form values without conversion', () => {
    expect(
      getAdditionalRebrandNamesValues({
        additionalBrandNames: 'Rebrand 1, Rebrand 2'
      })
    ).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
  })

  test('returns an empty value when the saved fuel name is nullish', () => {
    expect(
      getAdditionalRebrandNamesValues({ additionalBrandNames: null })
    ).toEqual({
      hasAdditionalBrandNames: false,
      additionalBrandNames: ''
    })
  })
})

describe('validateAdditionalRebrandNames', () => {
  test('accepts a valid yes selection with a populated value', () => {
    const result = validateAdditionalRebrandNames({
      addBrands: 'Yes',
      additionalBrands: ' Rebrand 1, Rebrand 2 '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
    expect(result.values).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: ' Rebrand 1, Rebrand 2 '
    })
  })

  test('rejects a yes selection when the additional rebrand names are blank', () => {
    const result = validateAdditionalRebrandNames({
      addBrands: 'Yes',
      additionalBrands: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      additionalBrands:
        'Enter any additional rebrand names the fuel will be sold under, separated by commas'
    })
    expect(result.errorList).toEqual([
      {
        field: 'additionalBrands',
        message:
          'Enter any additional rebrand names the fuel will be sold under, separated by commas',
        href: '#additional-brands'
      }
    ])
  })

  test('accepts a no selection and clears the additional rebrand names field', () => {
    const result = validateAdditionalRebrandNames({
      addBrands: 'No',
      additionalBrands: '   '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      hasAdditionalBrandNames: false,
      additionalBrandNames: '   '
    })
  })
})
