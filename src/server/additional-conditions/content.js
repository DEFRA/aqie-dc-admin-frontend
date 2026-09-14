export const additionalConditionsContent = {
  en: {
    pageTitle: 'Enter additional conditions',
    title: 'Enter additional conditions',
    description:
      'If there aren\'t any additional conditions required to use this appliance legally in smoke control areas, enter "No additional conditions for use".',
    saveButton: 'Save and mark as completed',
    cancel: 'Cancel',
    label: 'Additional conditions',
    characterCount: {
      limit: 1000,
      limitExceeded: (count) =>
        `You have ${count} ${count === 1 ? 'character' : 'characters'} too many`,
      empty:
        'Enter additional conditions for use or enter “No additional conditions for use”'
    },
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
