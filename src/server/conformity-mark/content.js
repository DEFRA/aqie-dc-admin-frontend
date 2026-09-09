/**
 * Copy text used by the conformity-mark review page.
 * Kept in one place so route handlers and templates stay consistent.
 */
export const conformityContent = {
  en: {
    heading: (modelName) => `Review conformity mark details for ${modelName}`,
    intro: 'Review conformity mark details and confirm it meets requirements.',
    markPassed: 'Mark as passed',
    markFailed: 'Mark as failed',
    cancel: 'Cancel'
  }
}
