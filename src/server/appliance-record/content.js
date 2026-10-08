/**
 * Appliance Record Content Layer
 *
 * Centralized localization and content strings for the appliance-record module.
 * All user-facing text is defined here following GOV.UK standards.
 *
 * This ensures:
 * - Single source of truth for all labels and messages
 * - Easy maintenance and internationalization
 * - Consistency across all appliance record pages
 * - No hardcoded strings in data transformation or controller layers
 */

export const applianceRecordContent = {
  en: {
    // Page metadata
    pageHeading: (modelName) => modelName,
    pageTitle: (modelName) => `Appliance record for ${modelName}`,

    // Section titles
    certificationStatusTitle: 'Certification status',
    certificationStatusCaption: 'Certification status by country',
    publicListingTitle: 'Public listing',
    detailsTitle: 'Details',

    // Table headers
    tableHeaders: {
      country: 'Country',
      status: 'Status',
      dateCertified: 'Date first certified',
      action: 'Action'
    },

    // Country names (per GOV.UK standards for UK constituent countries)
    countries: {
      england: 'England',
      scotland: 'Scotland',
      wales: 'Wales',
      northernIreland: 'Northern Ireland'
    },

    // Certification status labels with GOV.UK tag colors
    // Keys are display labels returned by data transformation layer
    certificationStatus: {
      'Awaiting decision': {
        label: 'Awaiting decision',
        tagClass: 'govuk-tag--yellow'
      },
      Certified: {
        label: 'Certified',
        tagClass: 'govuk-tag--green'
      },
      Uncertified: {
        label: 'Uncertified',
        tagClass: 'govuk-tag--grey'
      },
      'Not certified': {
        label: 'Not certified',
        tagClass: 'govuk-tag--grey'
      },
      Rejected: {
        label: 'Rejected',
        tagClass: 'govuk-tag--red'
      },
      notCertified: {
        label: 'Not certified'
      }
    },

    // Appliance status (pending, live, hidden) with GOV.UK tag colors
    applianceStatus: {
      pending: {
        label: 'Pending government approval',
        tagClass: 'govuk-tag--yellow'
      },
      live: {
        label: 'Live on public list',
        tagClass: 'govuk-tag--green'
      },
      hidden: {
        label: 'Hidden from public list',
        tagClass: 'govuk-tag--grey'
      }
    },

    // Detail section items - references to related pages
    detailsItems: {
      applianceDetails: 'Appliance details',
      testResults: 'Test results',
      instructionManual: 'Instruction manual',
      applicationDetails: 'Application details',
      actionHistory: 'Action history'
    },

    // Action link and button text
    actionText: 'View',
    changeText: 'Change',
    viewPublicListingText: 'View public listing',
    hideFromPublicText: 'Hide appliance from public list',
    makePublicText: 'Make appliance live on public list',

    // Navigation
    returnLink: 'Return to appliance records',

    // Error messages
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
