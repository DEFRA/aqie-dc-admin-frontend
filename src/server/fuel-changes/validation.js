import { fuelChangesContent } from './content.js'

const content = fuelChangesContent.en

export function getFuelChangesValues(fuel = {}) {
  const originalFuel = fuel.originalFuel ?? {}

  return {
    hasFuelChanges: Boolean(originalFuel.isChangedOrMixed),
    changes: originalFuel.changes ?? ''
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
        changes: changesValue
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
      hasFuelChanges,
      changes: changesValue
    },
    errors: {},
    errorList: [],
    isValid: true
  }
}
