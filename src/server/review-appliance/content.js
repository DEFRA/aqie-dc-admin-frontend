export const applianceReviewContent = {
  en: {
    pageTitle: 'Review appliance',
    documentationHeading: 'Review documentation',
    listingHeading: 'Prepare public listing',
    acceptButton: 'Accept appliance',
    rejectButton: 'Reject appliance',
    saveForLater: 'Save and come back later',
    applicationsHeading: 'Appliance applications',

    documentationTasks: [
      {
        key: 'testReports',
        title: 'Review test reports',
        path: 'review-test-reports'
      },
      {
        key: 'technicalDrawings',
        title: 'Review technical drawings',
        path: 'technical-drawings'
      },
      {
        key: 'conformityMark',
        title: 'Review conformity mark',
        path: 'conformity-mark'
      },
      {
        key: 'instructionManual',
        title: 'Review instruction manual',
        path: 'instruction-manual'
      }
    ],

    listingTasks: [
      {
        key: 'applianceDetails',
        title: 'Check appliance details',
        path: 'check-appliance-details'
      },
      {
        key: 'permittedFuels',
        title: 'Check permitted fuels',
        path: 'check-permitted-fuels'
      },
      {
        key: 'additionalConditions',
        title: 'Enter additional conditions',
        path: 'enter-additional-conditions'
      }
    ], // Ready-made govukTaskList status objects. Documentation checks are
    // tri-state; listing checks are binary.

    documentationStatuses: {
      passed: { tag: { text: 'Passed', classes: 'govuk-tag--green' } },
      failed: { tag: { text: 'Failed', classes: 'govuk-tag--red' } },
      notReviewed: { text: 'Not reviewed' }
    },

    listingStatuses: {
      completed: { tag: { text: 'Completed', classes: 'govuk-tag--blue' } },
      notCompleted: { text: 'Not completed' }
    },

    errors: {
      incompleteTitle: 'There is a problem',
      incomplete:
        'You cannot accept this appliance until every check has been completed and passed.',
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
