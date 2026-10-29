export const reviewFuelApplicationContent = {
  en: {
    pageTitle: (applicationId) => `Review fuel application ${applicationId}`,
    heading: (applicationId) => `Review fuel application ${applicationId}`,
    navigation: {
      home: 'Home',
      fuelApplications: 'Fuel applications',
      back: 'Back'
    },
    summaryCardTitle: 'Applicant details',
    fuelCardTitle: 'Fuel for review',
    labels: {
      companyName: 'Company name',
      companyAddress: 'Company address',
      mainContactName: 'Main contact name',
      mainContactEmail: 'Main contact email',
      mainContactAlternativeEmail: 'Main contact alternative email',
      mainContactPhone: 'Main contact telephone number',
      responsiblePerson: 'Responsible person',
      responsiblePersonEmail: 'Responsible person email',
      customerComplaints: 'Customer complaints system in place?',
      fuelSalesMethod: 'How do they sell the fuel?',
      manufacturerOrRebrander: 'Manufacturer or rebrander?'
    },
    table: {
      caption: (applicationId) => `Fuel in application ${applicationId}`,
      brandName: 'Brand name',
      status: 'Status',
      action: 'Action',
      empty: 'No fuels found for this application.'
    },
    actions: {
      continue: 'Continue',
      continueReview: 'Continue review',
      startReview: 'Start review',
      returnToList: 'Come back to this later'
    },
    statusTags: {
      new: {
        text: 'Start review',
        label: 'Not started',
        colour: 'govuk-tag--grey'
      },
      in_review: {
        text: 'Continue review',
        label: 'In progress',
        colour: 'govuk-tag--yellow'
      },
      accepted: {
        text: 'Edit review',
        label: 'Accepted',
        colour: 'govuk-tag--green'
      },
      rejected: {
        text: 'Edit review',
        label: 'Rejected',
        colour: 'govuk-tag--red'
      }
    },
    boolean: {
      yes: 'Yes',
      no: 'No'
    },
    supplierTypes: {
      Manufacture: 'Manufacturer',
      Rebrand: 'Rebrander'
    },
    notProvided: 'Not provided',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
