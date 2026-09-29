import {
  MINIMUM_PUBLICATION_YEAR,
  MAXIMUM_PUBLICATION_YEAR
} from '../common/constants/constants.js'
export const instructionManualContent = {
  en: {
    pageTitle: 'Review instruction manuals',
    title: 'Review instruction manuals',

    description:
      'Enter details of the most relevant manual so that a member of the public or industry professional can find it themselves.',

    publicationDescription:
      'These details will be published to the public listing.',

    fields: {
      title: {
        label: 'Title',
        maximumCharacters: 200
      },
      includeVersion: {
        legend: 'Do you want to include a version?',
        yes: 'Yes',
        no: 'No'
      },
      version: {
        label: 'Enter version',
        maximumCharacters: 100
      },
      publicationDate: {
        legend: 'Publication date',
        hint: 'For example, 27 3 2007',
        day: 'Day',
        month: 'Month',
        year: 'Year'
      }
    },

    buttons: {
      passed: 'Mark as passed',
      failed: 'Mark as failed',
      cancel: 'Cancel'
    },

    errors: {
      summaryTitle: 'There is a problem',
      generic: 'Sorry, there is a problem with the service',

      titleEmpty: 'Enter the title of the instruction manual',
      titleTooLong: 'Title must be 200 characters or less',

      includeVersionEmpty: 'Select if you want to include a version',

      versionEmpty: 'Enter a version name or number',
      versionTooLong: 'Version must be 100 characters or less',

      publicationDateEmpty: 'Enter the publication date',
      publicationDateDayEmpty: 'Publication date must include a day',
      publicationDateMonthEmpty: 'Publication date must include a month',
      publicationDateYearEmpty: 'Publication date must include a year',
      publicationDateInvalid: 'Publication date must be a real date',
      publicationDateYearRange: () =>
        `Publication date year must be between ${MINIMUM_PUBLICATION_YEAR} and ${MAXIMUM_PUBLICATION_YEAR}`
    }
  }
}
