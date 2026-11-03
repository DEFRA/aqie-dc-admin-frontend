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
                emptyMessage: 'smokeEmission must be a non-negative number when passed',
                failedMessage:
                    'smokeEmission must be a non-negative number or null when failed'
            },
            {
                name: 'sulphurContent',
                label: 'Sulphur content',
                unit: '%',
                emptyMessage: 'sulphurContent must be a non-negative number when passed',
                failedMessage:
                    'sulphurContent must be a non-negative number or null when failed'
            }
        ],
        errors: {
            generic: 'Sorry, there is a problem with the service'
        }
    }
}
