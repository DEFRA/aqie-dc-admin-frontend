import { describe, expect, test } from 'vitest'
import {
  buildPublicationDate,
  normaliseInstructionManualPayload,
  splitPublicationDate,
  validateInstructionManual
} from './validation.js'
import {
  MINIMUM_PUBLICATION_YEAR,
  MAXIMUM_PUBLICATION_YEAR
} from '../common/constants/constants.js'

function createValidPayload(overrides = {}) {
  return {
    action: 'passed',
    title: 'Twin Heat CS200i instruction manual',
    includeVersion: 'yes',
    version: '2.1',
    publicationDay: '25',
    publicationMonth: '9',
    publicationYear: '2027',
    ...overrides
  }
}

describe('validateInstructionManual', () => {
  test('returns no errors for a valid future publication date', () => {
    const result = validateInstructionManual(createValidPayload())

    expect(result.errors).toEqual([])
  })

  test('returns all mandatory field errors together', () => {
    const result = validateInstructionManual({
      action: 'passed',
      title: '',
      includeVersion: '',
      version: '',
      publicationDay: '',
      publicationMonth: '',
      publicationYear: ''
    })

    expect(result.errors).toEqual([
      {
        field: 'title',
        message: 'Enter the title of the instruction manual',
        href: '#title'
      },
      {
        field: 'includeVersion',
        message: 'Select if you want to include a version',
        href: '#includeVersion'
      },
      {
        field: 'publicationDate',
        message: 'Enter the publication date',
        href: '#publicationDate'
      }
    ])
  })

  test('requires version when include version is yes', () => {
    const result = validateInstructionManual(
      createValidPayload({
        includeVersion: 'yes',
        version: ''
      })
    )

    expect(result.errors).toContainEqual({
      field: 'version',
      message: 'Enter a version name or number',
      href: '#version'
    })
  })

  test('does not require version when include version is no', () => {
    const result = validateInstructionManual(
      createValidPayload({
        includeVersion: 'no',
        version: ''
      })
    )

    expect(result.errors).toEqual([])
  })

  test('rejects title longer than 200 characters', () => {
    const result = validateInstructionManual(
      createValidPayload({
        title: 'a'.repeat(201)
      })
    )

    expect(result.errors).toContainEqual({
      field: 'title',
      message: 'Title must be 200 characters or less',
      href: '#title'
    })
  })

  test('accepts title containing exactly 200 characters', () => {
    const result = validateInstructionManual(
      createValidPayload({
        title: 'a'.repeat(200)
      })
    )

    expect(result.errors).toEqual([])
  })

  test('rejects version longer than 100 characters', () => {
    const result = validateInstructionManual(
      createValidPayload({
        version: 'v'.repeat(101)
      })
    )

    expect(result.errors).toContainEqual({
      field: 'version',
      message: 'Version must be 100 characters or less',
      href: '#version'
    })
  })

  test('returns missing day error', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: ''
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must include a day',
      href: '#publicationDay'
    })
  })

  test('returns missing month error', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationMonth: ''
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must include a month',
      href: '#publicationMonth'
    })
  })

  test('returns missing year error', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationYear: ''
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must include a year',
      href: '#publicationYear'
    })
  })

  test('rejects a non-numeric date', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: 'day'
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must be a real date',
      href: '#publicationDate'
    })
  })

  test('rejects 31 February', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: '31',
        publicationMonth: '2',
        publicationYear: '2028'
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must be a real date',
      href: '#publicationDate'
    })
  })

  test('accepts leap day in a leap year', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: '29',
        publicationMonth: '2',
        publicationYear: '2028'
      })
    )

    expect(result.errors).toEqual([])
  })

  test('rejects leap day in a non-leap year', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: '29',
        publicationMonth: '2',
        publicationYear: '2027'
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: 'Publication date must be a real date',
      href: '#publicationDate'
    })
  })

  test('rejects a publication year below the minimum allowed year', () => {
    const yearBelowMinimum = String(MINIMUM_PUBLICATION_YEAR - 1)

    const result = validateInstructionManual(
      createValidPayload({
        publicationYear: yearBelowMinimum
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: `Publication date year must be between ${MINIMUM_PUBLICATION_YEAR} and ${MAXIMUM_PUBLICATION_YEAR}`,
      href: '#publicationYear'
    })
  })

  test('accepts the minimum allowed publication year', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: '1',
        publicationMonth: '1',
        publicationYear: String(MINIMUM_PUBLICATION_YEAR)
      })
    )

    expect(result.errors).toEqual([])
  })

  test('accepts the maximum allowed publication year', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationDay: '31',
        publicationMonth: '12',
        publicationYear: String(MAXIMUM_PUBLICATION_YEAR)
      })
    )

    expect(result.errors).toEqual([])
  })

  test('rejects a publication year above the maximum allowed year', () => {
    const result = validateInstructionManual(
      createValidPayload({
        publicationYear: String(MAXIMUM_PUBLICATION_YEAR + 1)
      })
    )

    expect(result.errors).toContainEqual({
      field: 'publicationDate',
      message: `Publication date year must be between ${MINIMUM_PUBLICATION_YEAR} and ${MAXIMUM_PUBLICATION_YEAR}`,
      href: '#publicationYear'
    })
  })
})

describe('normaliseInstructionManualPayload', () => {
  test('trims submitted values', () => {
    expect(
      normaliseInstructionManualPayload({
        action: ' passed ',
        title: ' Manual ',
        includeVersion: ' yes ',
        version: ' 2.1 ',
        publicationDay: ' 5 ',
        publicationMonth: ' 6 ',
        publicationYear: ' 2027 '
      })
    ).toEqual({
      action: 'passed',
      title: 'Manual',
      includeVersion: 'yes',
      version: '2.1',
      publicationDay: '5',
      publicationMonth: '6',
      publicationYear: '2027'
    })
  })
})

describe('buildPublicationDate', () => {
  test('builds an ISO publication date', () => {
    expect(
      buildPublicationDate({
        publicationDay: '5',
        publicationMonth: '9',
        publicationYear: '2027'
      })
    ).toBe('2027-09-05')
  })
})

describe('splitPublicationDate', () => {
  test('splits an ISO date for edit population', () => {
    expect(splitPublicationDate('2027-09-05')).toEqual({
      publicationDay: '5',
      publicationMonth: '9',
      publicationYear: '2027'
    })
  })

  test('returns empty values for a missing date', () => {
    expect(splitPublicationDate()).toEqual({
      publicationDay: '',
      publicationMonth: '',
      publicationYear: ''
    })
  })
})
