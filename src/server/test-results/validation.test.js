import { describe, expect, test } from 'vitest'

import {
  getTestResultsValues,
  validatePassedTestResults,
  validateFailedTestResults
} from './validation.js'

describe('validatePassedTestResults', () => {
  test('accepts valid smoke and sulphur measurements', () => {
    const result = validatePassedTestResults({
      smokeEmission: '1.25',
      sulphurContent: '0.5'
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
  })

  test('accepts zero values', () => {
    const result = validatePassedTestResults({
      smokeEmission: '0',
      sulphurContent: '0.0'
    })

    expect(result.isValid).toBe(true)
  })

  test('rejects empty values when passed', () => {
    const result = validatePassedTestResults({
      smokeEmission: '',
      sulphurContent: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      smokeEmission: 'smokeEmission must be a non-negative number when passed',
      sulphurContent: 'sulphurContent must be a non-negative number when passed'
    })
    expect(result.errorList).toHaveLength(2)
  })

  test('rejects negative values when passed', () => {
    const result = validatePassedTestResults({
      smokeEmission: '-1',
      sulphurContent: '0.5'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.smokeEmission).toBe(
      'smokeEmission must be a non-negative number when passed'
    )
  })

  test('preserves original submitted values after validation failure', () => {
    const result = validatePassedTestResults({
      smokeEmission: '-1',
      sulphurContent: '0.5'
    })

    expect(result.values.smokeEmission).toBe('-1')
    expect(result.values.sulphurContent).toBe('0.5')
  })
})

describe('getTestResultsValues', () => {
  test('maps backend values to form values', () => {
    const result = getTestResultsValues({
      smokeEmission: 1.25,
      sulphurContent: 0.5
    })

    expect(result).toEqual({
      smokeEmission: '1.25',
      sulphurContent: '0.5'
    })
  })

  test('preserves zero values', () => {
    const result = getTestResultsValues({
      smokeEmission: 0,
      sulphurContent: 0
    })

    expect(result).toEqual({
      smokeEmission: '0',
      sulphurContent: '0'
    })
  })
})

describe('validateFailedTestResults', () => {
  test('accepts empty values when failed', () => {
    const result = validateFailedTestResults({
      smokeEmission: '',
      sulphurContent: ''
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  test('accepts partial values when failed', () => {
    const result = validateFailedTestResults({
      smokeEmission: '2.3',
      sulphurContent: ''
    })

    expect(result.isValid).toBe(true)
  })

  test('rejects negative values when failed', () => {
    const result = validateFailedTestResults({
      smokeEmission: '-1',
      sulphurContent: '0.5'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.smokeEmission).toBe(
      'smokeEmission must be a non-negative number or null when failed'
    )
  })
})
