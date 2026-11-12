import { describe, expect, test } from 'vitest'

import {
  getAdditionalBrandNamesValues,
  validateAdditionalBrandNames
} from './validation.js'

describe('getAdditionalBrandNamesValues', () => {
  test('maps a saved string value for manufacturer brand names', () => {
    expect(
      getAdditionalBrandNamesValues({
        additionalBrandNames: 'Brand 1, Brand 2'
      })
    ).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Brand 1, Brand 2'
    })
  })

  test('maps a saved string value for rebrand names', () => {
    expect(
      getAdditionalBrandNamesValues({
        additionalBrandNames: 'Rebrand 1, Rebrand 2'
      })
    ).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
  })

  test('returns empty value when saved brand names are nullish', () => {
    expect(
      getAdditionalBrandNamesValues({ additionalBrandNames: null })
    ).toEqual({
      hasAdditionalBrandNames: false,
      additionalBrandNames: ''
    })
  })

  test('returns empty value when called with undefined fuel', () => {
    expect(getAdditionalBrandNamesValues()).toEqual({
      hasAdditionalBrandNames: false,
      additionalBrandNames: ''
    })
  })
})

describe('validateAdditionalBrandNames', () => {
  test('accepts a valid yes selection with manufacturer brand names', () => {
    const result = validateAdditionalBrandNames({
      addBrands: 'Yes',
      additionalBrands: ' Brand 1, Brand 2 '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
    expect(result.values).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: ' Brand 1, Brand 2 '
    })
  })

  test('accepts a valid yes selection with rebrand names', () => {
    const result = validateAdditionalBrandNames({
      addBrands: 'Yes',
      additionalRebrandBrands: ' Rebrand 1, Rebrand 2 '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
    expect(result.values).toEqual({
      hasAdditionalBrandNames: true,
      additionalBrandNames: ' Rebrand 1, Rebrand 2 '
    })
  })

  test('rejects a yes selection when brand names are blank', () => {
    const result = validateAdditionalBrandNames({
      addBrands: 'Yes',
      additionalBrands: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      additionalBrands: expect.any(String)
    })
    expect(result.errorList[0]).toEqual(
      expect.objectContaining({
        field: 'additionalBrands',
        message: expect.any(String),
        href: '#additional-brands'
      })
    )
  })

  test('rejects a yes selection when rebrand names are blank', () => {
    const result = validateAdditionalBrandNames({
      addBrands: 'Yes',
      additionalRebrandBrands: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      additionalRebrandBrands: expect.any(String)
    })
    expect(result.errorList[0]).toEqual(
      expect.objectContaining({
        field: 'additionalRebrandBrands',
        message: expect.any(String),
        href: '#additional-rebrand-brands'
      })
    )
  })

  test('accepts a no selection and clears the brand names field', () => {
    const result = validateAdditionalBrandNames({
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

  test('accepts a no selection and clears the rebrand names field', () => {
    const result = validateAdditionalBrandNames({
      addBrands: 'No',
      additionalRebrandBrands: '   '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      hasAdditionalBrandNames: false,
      additionalBrandNames: '   '
    })
  })
})
