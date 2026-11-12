import { fuelChangesContent } from './content.js'

const content = fuelChangesContent.en

export function getFuelChangesValues(fuel = {}) {
  const originalFuel = fuel.originalFuel ?? null
  const isChangedOrMixed = originalFuel?.isChangedOrMixed ?? null

  return {
    hasFuelChanges:
      isChangedOrMixed === true
        ? true
        : isChangedOrMixed === false
          ? false
          : null,
    changes: originalFuel?.changes ?? ''
  }
}

export function validateFuelChanges(payload = {}) {
  const isChangedOrMixed = payload.isChangedOrMixed
  const changesValue = payload.changes ?? ''
  const trimmed = changesValue.trim()
  const hasFuelChanges = isChangedOrMixed === 'Yes'

  if (hasFuelChanges && !trimmed) {
    const error = {
      field: 'changes',
      message: content.errors.changesRequired,
      href: '#changes'
    }

    return {
      values: {
        hasFuelChanges: true,
        changes: ''
      },
      errors: {
        changes: error.message
      },
      errorList: [error],
      isValid: false
    }
  }

  return {
    values: {
      hasFuelChanges:
        isChangedOrMixed === 'Yes'
          ? true
          : isChangedOrMixed === 'No'
            ? false
            : null,
      changes: trimmed
    },
    errors: {},
    errorList: [],
    isValid: true
  }
}
