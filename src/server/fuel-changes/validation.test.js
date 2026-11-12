import { describe, expect, test } from 'vitest'

import { getFuelChangesValues, validateFuelChanges } from './validation.js'

describe('getFuelChangesValues', () => {
  test('maps a saved boolean value into the form values without conversion', () => {
    expect(
      getFuelChangesValues({
        originalFuel: {
          isChangedOrMixed: true,
          changes: 'Mixed with another fuel'
        }
      })
    ).toEqual({
      hasFuelChanges: true,
      changes: 'Mixed with another fuel'
    })
  })

  test('returns an unanswered tri-state when the saved fuel data is nullish', () => {
    expect(getFuelChangesValues({ originalFuel: null })).toEqual({
      hasFuelChanges: null,
      changes: ''
    })
    expect(getFuelChangesValues({})).toEqual({
      hasFuelChanges: null,
      changes: ''
    })
  })
})

describe('validateFuelChanges', () => {
  test('accepts a valid yes selection with a populated value', () => {
    const result = validateFuelChanges({
      isChangedOrMixed: 'Yes',
      changes: '  Mixed with another fuel  '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
    expect(result.values).toEqual({
      hasFuelChanges: true,
      changes: 'Mixed with another fuel'
    })
  })

  test('rejects a yes selection when the change details are blank', () => {
    const result = validateFuelChanges({
      isChangedOrMixed: 'Yes',
      changes: '   '
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      changes:
        'Enter details of how the fuel has been altered or mixed with another fuel'
    })
    expect(result.errorList).toEqual([
      {
        field: 'changes',
        message:
          'Enter details of how the fuel has been altered or mixed with another fuel',
        href: '#changes'
      }
    ])
  })

  test('accepts a no selection and leaves the change details blank', () => {
    const result = validateFuelChanges({
      isChangedOrMixed: 'No',
      changes: '   '
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      hasFuelChanges: false,
      changes: ''
    })
  })
})
