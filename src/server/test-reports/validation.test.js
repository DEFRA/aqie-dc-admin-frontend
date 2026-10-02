import { describe, expect, test } from 'vitest'

import {
  getTestReportValues,
  validatePassedTestReport,
  validateFailedTestReport
} from './validation.js'

const validPayload = {
  ratedOutput: '5.2',
  testedOutputRated: '5.1',
  testedOutputLow: '2.4',
  smokeEmissionOutputRated: '3.1',
  smokeEmissionOutputLow: '2.2'
}

describe('validatePassedTestReport', () => {
  test('accepts valid whole numbers and decimals', () => {
    const result = validatePassedTestReport(validPayload)

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
  })

  test('accepts zero and zero decimal values', () => {
    const result = validatePassedTestReport({
      ratedOutput: '0',
      testedOutputRated: '0.0',
      testedOutputLow: '0',
      smokeEmissionOutputRated: '0.0',
      smokeEmissionOutputLow: '0'
    })

    expect(result.isValid).toBe(true)
  })

  test('accepts a decimal starting with a point', () => {
    const result = validatePassedTestReport({
      ...validPayload,
      ratedOutput: '.5'
    })

    expect(result.isValid).toBe(true)
  })

  test('trims spaces around a valid value', () => {
    const result = validatePassedTestReport({
      ...validPayload,
      ratedOutput: '  5.2  '
    })

    expect(result.isValid).toBe(true)
    expect(result.values.ratedOutput).toBe('5.2')
  })

  test('returns an error for every empty field', () => {
    const result = validatePassedTestReport({
      ratedOutput: '',
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    })

    expect(result.isValid).toBe(false)

    expect(result.errors).toEqual({
      ratedOutput: 'Enter the rated output',
      testedOutputRated: 'Enter the tested output - rated',
      testedOutputLow: 'Enter the tested output - low',
      smokeEmissionOutputRated: 'Enter the smoke emission output - rated',
      smokeEmissionOutputLow: 'Enter the smoke emission output - low'
    })

    expect(result.errorList).toHaveLength(5)
  })

  test.each([
    '-1',
    '-4.7',
    'abc',
    '5abc',
    'abc5',
    '5a6',
    '5..6',
    '.',
    '-',
    '+5',
    '1,000'
  ])('rejects invalid rated output: %s', (ratedOutput) => {
    const result = validatePassedTestReport({
      ...validPayload,
      ratedOutput
    })

    expect(result.isValid).toBe(false)

    expect(result.errors.ratedOutput).toBe('The rated output must be a number')
  })

  test('returns errors for all invalid fields', () => {
    const result = validatePassedTestReport({
      ratedOutput: 'abc',
      testedOutputRated: '-1',
      testedOutputLow: '2abc',
      smokeEmissionOutputRated: '.',
      smokeEmissionOutputLow: '1..2'
    })

    expect(result.isValid).toBe(false)
    expect(result.errorList).toHaveLength(5)
  })

  test('preserves submitted values after an error', () => {
    const result = validatePassedTestReport({
      ...validPayload,
      testedOutputLow: '-4.7'
    })

    expect(result.values.testedOutputLow).toBe('-4.7')
  })

  test('creates an error link matching the input ID', () => {
    const result = validatePassedTestReport({
      ...validPayload,
      testedOutputLow: 'abc'
    })

    expect(result.errorList).toEqual([
      {
        text: 'The tested output - low must be a number',
        href: '#testedOutputLow'
      }
    ])
  })

  test('rejects a value that converts to Infinity', () => {
    const result = validatePassedTestReport({
      ...validPayload,
      ratedOutput: '9'.repeat(1000)
    })

    expect(result.isValid).toBe(false)

    expect(result.errors.ratedOutput).toBe('The rated output must be a number')
  })
})

describe('getTestReportValues', () => {
  test('maps nested backend values to flat form values', () => {
    const result = getTestReportValues({
      ratedOutput: 5.2,
      testedOutput: {
        rated: 5.1,
        low: 2.4
      },
      smokeEmissionOutput: {
        rated: 3.1,
        low: 2.2
      }
    })

    expect(result).toEqual({
      ratedOutput: '5.2',
      testedOutputRated: '5.1',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '3.1',
      smokeEmissionOutputLow: '2.2'
    })
  })

  test('preserves numeric zero values', () => {
    const result = getTestReportValues({
      ratedOutput: 0,
      testedOutput: {
        rated: 0,
        low: 0
      },
      smokeEmissionOutput: {
        rated: 0,
        low: 0
      }
    })

    expect(result).toEqual({
      ratedOutput: '0',
      testedOutputRated: '0',
      testedOutputLow: '0',
      smokeEmissionOutputRated: '0',
      smokeEmissionOutputLow: '0'
    })
  })
})

describe('validateFailedTestReport', () => {
  test('accepts all empty fields', () => {
    const result = validateFailedTestReport({
      ratedOutput: '',
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
  })

  test('accepts partial empty fields with valid non-empty values', () => {
    const result = validateFailedTestReport({
      ratedOutput: '5.2',
      testedOutputRated: '',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '2.2'
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  test('accepts all valid numbers with some empty fields', () => {
    const result = validateFailedTestReport({
      ratedOutput: '',
      testedOutputRated: '5.1',
      testedOutputLow: '',
      smokeEmissionOutputRated: '3.1',
      smokeEmissionOutputLow: '2.2'
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  test('accepts all valid numbers', () => {
    const result = validateFailedTestReport(validPayload)

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.errorList).toEqual([])
  })

  test('accepts zero and decimal values', () => {
    const result = validateFailedTestReport({
      ratedOutput: '0',
      testedOutputRated: '0.0',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '0'
    })

    expect(result.isValid).toBe(true)
  })

  test('accepts a decimal starting with a point', () => {
    const result = validateFailedTestReport({
      ratedOutput: '.5',
      testedOutputRated: '',
      testedOutputLow: '.25',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '.1'
    })

    expect(result.isValid).toBe(true)
  })

  test('trims spaces around valid values', () => {
    const result = validateFailedTestReport({
      ratedOutput: '  5.2  ',
      testedOutputRated: '',
      testedOutputLow: '  2.4  ',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '  2.2  '
    })

    expect(result.isValid).toBe(true)
    expect(result.values.ratedOutput).toBe('5.2')
    expect(result.values.testedOutputLow).toBe('2.4')
  })

  test('rejects non-empty invalid values', () => {
    const result = validateFailedTestReport({
      ratedOutput: 'abc',
      testedOutputRated: '',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: '2.2'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.ratedOutput).toBe('The rated output must be a number')
    expect(result.errors.testedOutputRated).toBeUndefined()
  })

  test.each([
    '-1',
    '-4.7',
    'abc',
    '5abc',
    'abc5',
    '5a6',
    '5..6',
    '.',
    '-',
    '+5',
    '1,000'
  ])('rejects invalid non-empty value: %s', (invalidValue) => {
    const result = validateFailedTestReport({
      ratedOutput: invalidValue,
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.ratedOutput).toBe('The rated output must be a number')
  })

  test('allows empty fields while rejecting invalid non-empty fields', () => {
    const result = validateFailedTestReport({
      ratedOutput: 'abc',
      testedOutputRated: '-1',
      testedOutputLow: '',
      smokeEmissionOutputRated: 'xyz',
      smokeEmissionOutputLow: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errorList).toHaveLength(3)
    expect(result.errors).toEqual({
      ratedOutput: 'The rated output must be a number',
      testedOutputRated: 'The tested output - rated must be a number',
      smokeEmissionOutputRated:
        'The smoke emission output - rated must be a number'
    })
  })

  test('preserves submitted values after validation error', () => {
    const result = validateFailedTestReport({
      ratedOutput: 'abc',
      testedOutputRated: '',
      testedOutputLow: '2.4',
      smokeEmissionOutputRated: '-1',
      smokeEmissionOutputLow: ''
    })

    expect(result.values.ratedOutput).toBe('abc')
    expect(result.values.testedOutputRated).toBe('')
    expect(result.values.testedOutputLow).toBe('2.4')
    expect(result.values.smokeEmissionOutputRated).toBe('-1')
    expect(result.values.smokeEmissionOutputLow).toBe('')
  })

  test('creates error links matching input IDs', () => {
    const result = validateFailedTestReport({
      ratedOutput: 'abc',
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    })

    expect(result.errorList).toEqual([
      {
        text: 'The rated output must be a number',
        href: '#ratedOutput'
      }
    ])
  })

  test('rejects a value that converts to Infinity', () => {
    const result = validateFailedTestReport({
      ratedOutput: '9'.repeat(1000),
      testedOutputRated: '',
      testedOutputLow: '',
      smokeEmissionOutputRated: '',
      smokeEmissionOutputLow: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.ratedOutput).toBe('The rated output must be a number')
  })
})
