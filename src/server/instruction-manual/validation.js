import { instructionManualContent } from './content.js'
import {
  MINIMUM_PUBLICATION_YEAR,
  MAXIMUM_PUBLICATION_YEAR
} from '../common/constants/constants.js'

const content = instructionManualContent.en

export const TITLE_MAX_LENGTH = content.fields.title.maximumCharacters

export const VERSION_MAX_LENGTH = content.fields.version.maximumCharacters

/**
 * Converts a value to a trimmed string.
 *
 * @param {*} value - Raw submitted value.
 * @returns {string} Trimmed string.
 */
function normaliseString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Creates a field validation error.
 *
 * @param {string} field - Field associated with the error.
 * @param {string} message - User-facing GOV.UK error message.
 * @param {string} href - Anchor linking to the relevant field.
 * @returns {{field: string, message: string, href: string}}
 */
function createError(field, message, href) {
  return {
    field,
    message,
    href
  }
}

/**
 * Determines whether all publication date values are empty.
 *
 * @param {object} values - Normalised form values.
 * @returns {boolean} True when all date fields are empty.
 */
function isPublicationDateEmpty(values) {
  return (
    values.publicationDay.length === 0 &&
    values.publicationMonth.length === 0 &&
    values.publicationYear.length === 0
  )
}

/**
 * Validates that a date represents a genuine calendar date.
 *
 * JavaScript normalises invalid dates, such as 31 February, into another
 * month. Comparing the resulting components prevents those dates from being
 * accepted.
 *
 * @param {number} day - Publication day.
 * @param {number} month - Publication month.
 * @param {number} year - Publication year.
 * @returns {boolean} True when the date is real.
 */
function isRealDate(day, month, year) {
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/**
 * Validates the publication date and adds no more than one date error.
 *
 * @param {object} values - Normalised form values.
 * @param {Array<object>} errors - Error collection to update.
 * @returns {void}
 */
function validatePublicationDate(values, errors) {
  if (isPublicationDateEmpty(values)) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateEmpty,
        '#publicationDate'
      )
    )
    return
  }

  if (values.publicationDay.length === 0) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateDayEmpty,
        '#publicationDay'
      )
    )
    return
  }

  if (values.publicationMonth.length === 0) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateMonthEmpty,
        '#publicationMonth'
      )
    )
    return
  }

  if (values.publicationYear.length === 0) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateYearEmpty,
        '#publicationYear'
      )
    )
    return
  }

  const containsOnlyNumbers =
    /^\d{1,2}$/.test(values.publicationDay) &&
    /^\d{1,2}$/.test(values.publicationMonth) &&
    /^\d+$/.test(values.publicationYear)

  if (!containsOnlyNumbers) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateInvalid,
        '#publicationDate'
      )
    )
    return
  }

  const day = Number(values.publicationDay)
  const month = Number(values.publicationMonth)
  const year = Number(values.publicationYear)

  if (year < MINIMUM_PUBLICATION_YEAR || year > MAXIMUM_PUBLICATION_YEAR) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateYearRange(),
        '#publicationYear'
      )
    )
    return
  }

  if (!isRealDate(day, month, year)) {
    errors.push(
      createError(
        'publicationDate',
        content.errors.publicationDateInvalid,
        '#publicationDate'
      )
    )
  }
}

/**
 * Normalises the instruction-manual payload.
 *
 * @param {object} payload - Hapi request payload.
 * @returns {object} Normalised form values.
 */
export function normaliseInstructionManualPayload(payload = {}) {
  return {
    action: normaliseString(payload.action),
    title: normaliseString(payload.title),
    includeVersion: normaliseString(payload.includeVersion),
    version: normaliseString(payload.version),
    publicationDay: normaliseString(payload.publicationDay),
    publicationMonth: normaliseString(payload.publicationMonth),
    publicationYear: normaliseString(payload.publicationYear)
  }
}

/**
 * Validates a Mark as passed instruction-manual submission.
 *
 * Mark as failed intentionally does not use this validation.
 *
 * @param {object} payload - Normalised or raw request payload.
 * @returns {{values: object, errors: Array<object>}} Validation result.
 */
export function validateInstructionManual(payload = {}) {
  const values = normaliseInstructionManualPayload(payload)
  const errors = []

  if (values.title.length === 0) {
    errors.push(createError('title', content.errors.titleEmpty, '#title'))
  } else if (values.title.length > TITLE_MAX_LENGTH) {
    errors.push(createError('title', content.errors.titleTooLong, '#title'))
  }

  if (!['yes', 'no'].includes(values.includeVersion)) {
    errors.push(
      createError(
        'includeVersion',
        content.errors.includeVersionEmpty,
        '#includeVersion'
      )
    )
  }

  if (values.includeVersion === 'yes') {
    if (values.version.length === 0) {
      errors.push(
        createError('version', content.errors.versionEmpty, '#version')
      )
    } else if (values.version.length > VERSION_MAX_LENGTH) {
      errors.push(
        createError('version', content.errors.versionTooLong, '#version')
      )
    }
  }

  validatePublicationDate(values, errors)

  return {
    values,
    errors
  }
}

/**
 * Converts a validated publication date into ISO date format.
 *
 * This method must only be called after successful validation.
 *
 * @param {object} values - Validated form values.
 * @returns {string} Date in YYYY-MM-DD format.
 */
export function buildPublicationDate(values) {
  const month = values.publicationMonth.padStart(2, '0')
  const day = values.publicationDay.padStart(2, '0')

  return `${values.publicationYear}-${month}-${day}`
}

/**
 * Converts an ISO date into individual date input values.
 *
 * @param {string|null|undefined} publicationDate - Stored ISO date.
 * @returns {{publicationDay: string, publicationMonth: string, publicationYear: string}}
 */
export function splitPublicationDate(publicationDate) {
  if (
    typeof publicationDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(publicationDate)
  ) {
    return {
      publicationDay: '',
      publicationMonth: '',
      publicationYear: ''
    }
  }

  const [year, month, day] = publicationDate.split('-')

  return {
    publicationDay: String(Number(day)),
    publicationMonth: String(Number(month)),
    publicationYear: year
  }
}
