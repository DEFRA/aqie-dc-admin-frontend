export const checkPermittedFuelsContent = {
  en: {
    heading: (modelName) => `Permitted fuels for ${modelName}`,
    permittedFuelsLabel: 'What fuels is this appliance permitted to burn?',
    woodQuestion: 'Is this appliance permitted to burn wood?',
    woodHint:
      'If yes, the public listing for this appliance will contain guidance on how to burn wood.',
    markAsCompleted: 'Mark as completed',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    characterCount: {
      limit: 1000,
      limitExceeded: (count) =>
        `You have ${count} ${count === 1 ? 'character' : 'characters'} too many`
    },
    errors: {
      generic: 'Sorry, there is a problem with the service',
      summaryTitle: 'There is a problem',
      prefix: 'Error:',
      permittedFuelsRequired:
        'Enter which fuels the appliance is permitted to burn',
      woodSelectionRequired: 'Select if the appliance is cerified to burn wood'
    }
  }
}
