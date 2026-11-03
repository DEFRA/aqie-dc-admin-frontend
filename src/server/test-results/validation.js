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

export const getTestResultsValues = (payload = {}) => ({
  smokeEmission: normaliseValue(payload.smokeEmission),
  sulphurContent: normaliseValue(payload.sulphurContent)
})

const isValidDecimal = (value) => {
  return decimalPattern.test(value) && Number.isFinite(Number(value))
}

export const validatePassedTestResults = (payload = {}) => {
  const values = getTestResultsValues(payload)
  const errors = {}

  for (const field of Object.keys(values)) {
    const value = values[field]

    if (value === '' || !isValidDecimal(value) || Number(value) < 0) {
      errors[field] =
        field === 'smokeEmission'
          ? 'smokeEmission must be a non-negative number when passed'
          : 'sulphurContent must be a non-negative number when passed'
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

export const validateFailedTestResults = (payload = {}) => {
  const values = getTestResultsValues(payload)
  const errors = {}

  for (const field of Object.keys(values)) {
    const value = values[field]

    if (value !== '' && (!isValidDecimal(value) || Number(value) < 0)) {
      errors[field] =
        field === 'smokeEmission'
          ? 'smokeEmission must be a non-negative number or null when failed'
          : 'sulphurContent must be a non-negative number or null when failed'
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
