export const testResultsContent = {
  en: {
    pageTitlePrefix: 'Add test results for',
    backLinkText: 'Back',
    intro:
      'Test results will be included in the recommendation to government. They will not be made public.',
    submitPassed: 'Mark as passed',
    submitFailed: 'Mark as failed',
    cancel: 'Cancel',
    errorSummaryTitle: 'There is a problem',
    fields: [
      {
        name: 'smokeEmission',
        label: 'Smoke emission measurement',
        unit: 'g/h',
        emptyMessage: 'Enter the smoke emission measurement',
        numberMessage: 'The smoke emission measurement must be a number'
      },
      {
        name: 'sulphurContent',
        label: 'Sulphur content',
        unit: '%',
        emptyMessage: 'Enter the sulphur content',
        numberMessage: 'The sulphur content must be a number'
      }
    ],
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
