export const variantApplianceContent = {
  en: {
    heading: (modelName) =>
      `Is ${modelName} a variant of a certified appliance?`,
    legend: 'Is this appliance a variant of a certified appliance?',
    saveButton: 'Save changes',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    detailsLabel: 'Details of the certified variant',
    characterCount: {
      limit: 1000,
      limitExceeded: (count) =>
        `You have ${count} ${count === 1 ? 'character' : 'characters'} too many`,
      empty: 'Enter details of the certified variant appliance'
    },
    errors: {
      summaryTitle: 'There is a problem',
      detailsRequired: 'Enter details of the certified variant appliance',
      detailsMaxLength: (charsOver) =>
        `Details must be 1000 characters or less (${charsOver} characters too many)`,
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
