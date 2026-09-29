export const nominalOutputContent = {
  en: {
    heading: (modelName) =>
      `What is the nominal (thermal) output of ${modelName}?`,
    label: 'Nominal (thermal) output',
    suffix: 'kW',
    saveChanges: 'Save changes',
    cancel: 'Cancel',
    errors: {
      generic: 'Sorry, there is a problem with the service',
      summaryTitle: 'There is a problem',
      required: 'Enter the nominal (thermal) output of the appliance',
      tooHigh: 'Nominal (thermal) output must be less than 1,000 kW'
    }
  }
}
