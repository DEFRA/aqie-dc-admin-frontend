export const decimalPattern = /^(?:\d+(?:\.\d+)?|\.\d+)$/

const normaliseValue = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return ''
}

export const testResultsFields = Object.freeze([
  {
    name: 'smokeEmission',
    emptyMessage: 'Enter the smoke emission measurement',
    numberMessage: 'The smoke emission measurement must be a number'
  },
  {
    name: 'sulphurContent',
    emptyMessage: 'Enter the sulphur content',
    numberMessage: 'The sulphur content must be a number'
  }
])

export const getTestResultsValues = (payload = {}) => ({
  smokeEmission: normaliseValue(payload.smokeEmission),
  sulphurContent: normaliseValue(payload.sulphurContent)
})

const isValidDecimal = (value) => {
  return decimalPattern.test(value) && Number.isFinite(Number(value))
}

const buildValidationResult = (values, mode) => {
  const errors = {}

  for (const field of testResultsFields) {
    const value = values[field.name]
    const isEmpty = value === ''
    const isInvalid =
      value !== '' && (!isValidDecimal(value) || Number(value) < 0)

    if (mode === 'passed') {
      if (isEmpty) {
        errors[field.name] = field.emptyMessage
      } else if (isInvalid) {
        errors[field.name] = field.numberMessage
      }
      continue
    }

    if (!isEmpty && isInvalid) {
      errors[field.name] = field.numberMessage
    }
  }

  const errorList = Object.entries(errors).map(([name, text]) => ({
    text,
    href: `#${name}`
  }))

  return {
    values,
    errors,
    errorList,
    isValid: errorList.length === 0
  }
}

export const validatePassedTestResults = (payload = {}) => {
  return buildValidationResult(getTestResultsValues(payload), 'passed')
}

export const validateFailedTestResults = (payload = {}) => {
  return buildValidationResult(getTestResultsValues(payload), 'failed')
}
