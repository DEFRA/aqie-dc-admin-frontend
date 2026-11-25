import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'

/**
 * Fuel Record Content Layer
 * All user-facing text for the fuel-record page.
 */
const supplierTypeLabels = {
  Manufacture: 'Manufacturer',
  Rebrand: 'Rebrander'
}

export const fuelRecordContent = {
  en: {
    pageTitle: (name) => `Fuel record for ${name}`,
    defaultName: 'Unknown fuel',

    statusValues: {
      pending: 'pending',
      live: 'live',
      hidden: 'hidden',
      rejected: 'rejected'
    },

    // Matches backend supplierType values
    supplierTypes: {
      manufacture: 'Manufacture',
      rebrand: 'Rebrand'
    },

    publicListingTitle: 'Public listing',
    certificationStatusTitle: 'Certification status',
    detailsTitle: 'Details',

    tableHeaders: {
      country: 'Country',
      status: 'Status',
      dateFirstCertified: 'Date first certified',
      action: 'Action'
    },

    countries: {
      england: 'England',
      scotland: 'Scotland',
      wales: 'Wales',
      northernIreland: 'Northern Ireland'
    },

    certificationStatus: {
      awaiting_decision: {
        label: 'Awaiting decision',
        tagClass: 'govuk-tag--yellow'
      },
      certified: { label: 'Certified', tagClass: 'govuk-tag--green' },
      uncertified: { label: 'Uncertified', tagClass: 'govuk-tag--grey' }
    },

    notCertifiedText: 'Not certified',

    fuelStatus: {
      pending: {
        label: 'Pending government approval',
        tagClass: 'govuk-tag--yellow'
      },
      live: { label: 'Live on public list', tagClass: 'govuk-tag--green' },
      hidden: {
        label: 'Hidden from public list',
        tagClass: 'govuk-tag--grey'
      },
      rejected: { label: 'Rejected', tagClass: 'govuk-tag--red' }
    },

    detailsItems: {
      fuelDetails: 'Fuel details',
      testResults: 'Test results',
      actionHistory: 'Action history'
    },

    formatApplicationDetailsLabel: (applicationId, supplierType) => {
      const base = applicationId
        ? `Application ${formatApplicationId(applicationId)} details`
        : 'Application details'
      const supplierLabel = supplierTypeLabels[supplierType]
      return supplierLabel ? `${base} - ${supplierLabel}` : base
    },

    actionText: 'View',
    changeText: 'Change',
    changeHiddenText: (country) => ` certification status for ${country}`,
    viewPublicListingText: 'View public listing',
    hideFromPublicText: 'Hide fuel from public list',
    makePublicText: 'Make fuel live on public list',

    backLinkText: 'Back',
    returnLink: 'Return to fuel records',

    nav: {
      home: 'Home',
      homeHref: '/manage-certification',
      fuelRecords: 'Fuel records',
      fuelRecordsHref: '/fuel-records',
      returnToRecord: 'Return to record'
    },

    errors: {
      generic: 'Sorry, there is a problem with the service',
      notFound: 'Fuel record not found'
    }
  }
}
