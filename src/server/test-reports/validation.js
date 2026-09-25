/**
 * Accepts non-negative whole numbers and decimals.
 *
 * Accepted examples:
 * 0
 * 0.0
 * 10
 * 10.25
 * .5
 *
 * Rejected examples:
 * -1
 * -1.5
 * abc
 * 1abc
 * abc1
 * 1a2
 * 1..2
 * .
 *
 * There is deliberately no maximum value or length limit.
 *
 * Values containing more than two decimal places are accepted.
 * They are rounded to two decimal places when the passed payload
 * is created.
 */
const decimalPattern = /^(?:\d+(?:\.\d+)?|\.\d+)$/

export const testReportFields = Object.freeze([
  {
    name: 'ratedOutput',
    label: 'Rated output',
    unit: 'kW',
    emptyMessage: 'Enter the rated output',
    numberMessage: 'The rated output must be a number'
  },
  {
    name: 'testedOutputRated',
    label: 'Tested output - rated',
    unit: 'kW',
    emptyMessage: 'Enter the tested output - rated',
    numberMessage: 'The tested output - rated must be a number'
  },
  {
    name: 'testedOutputLow',
    label: 'Tested output - low',
    unit: 'kW',
    emptyMessage: 'Enter the tested output - low',
    numberMessage: 'The tested output - low must be a number'
  },
  {
    name: 'smokeEmissionOutputRated',
    label: 'Smoke emission output - rated',
    unit: 'grams per hour',
    emptyMessage: 'Enter the smoke emission output - rated',
    numberMessage: 'The smoke emission output - rated must be a number'
  },
  {
    name: 'smokeEmissionOutputLow',
    label: 'Smoke emission output - low',
    unit: 'grams per hour',
    emptyMessage: 'Enter the smoke emission output - low',
    numberMessage: 'The smoke emission output - low must be a number'
  }
])

const normaliseValue = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return ''
  }

  return String(value).trim()
}

/**
 * Converts backend nested values into the flat structure required
 * by the HTML form.
 *
 * Flat value fallbacks are used for submitted form payloads.
 */
export const getTestReportValues = (payload = {}) => ({
  ratedOutput: normaliseValue(payload.ratedOutput),

  testedOutputRated: normaliseValue(
    payload.testedOutput?.rated ?? payload.testedOutputRated
  ),

  testedOutputLow: normaliseValue(
    payload.testedOutput?.low ?? payload.testedOutputLow
  ),

  smokeEmissionOutputRated: normaliseValue(
    payload.smokeEmissionOutput?.rated ?? payload.smokeEmissionOutputRated
  ),

  smokeEmissionOutputLow: normaliseValue(
    payload.smokeEmissionOutput?.low ?? payload.smokeEmissionOutputLow
  )
})

/**
 * Validates all five measurements when the user clicks
 * "Mark as passed".
 *
 * This function must not be called when the user clicks
 * "Mark as failed".
 */
export const validatePassedTestReport = (payload = {}) => {
  const values = getTestReportValues(payload)
  const errors = {}

  for (const field of testReportFields) {
    const value = values[field.name]

    if (value === '') {
      errors[field.name] = field.emptyMessage
      continue
    }

    /*
     * The regular expression rejects negative values, letters
     * and incomplete decimals.
     *
     * Number.isFinite prevents extremely large values from
     * becoming Infinity during number conversion.
     */
    if (!decimalPattern.test(value) || !Number.isFinite(Number(value))) {
      errors[field.name] = field.numberMessage
    }
  }

  const errorList = testReportFields
    .filter(({ name }) => errors[name])
    .map(({ name }) => ({
      text: errors[name],
      href: `#${name}`
    }))

  return {
    values,
    errors,
    errorList,
    isValid: errorList.length === 0
  }
}
