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
    defaultModelName: 'Unknown model',

    // Core status values used across the data transform and controller
    statusValues: {
      pending: 'pending',
      live: 'live',
      hidden: 'hidden',
      rejected: 'rejected'
    },

    // Section titles
    certificationStatusTitle: 'Certification status',
    certificationStatusCaption: 'Certification status by country',
    publicListingTitle: 'Public listing',
    detailsTitle: 'Details',
    legacyDetailsTitle: 'Legacy Record Details',

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

    // Certification status labels with GOV.UK tag colors, keyed by backend value
    certificationStatus: {
      awaiting_decision: {
        label: 'Awaiting decision',
        tagClass: 'govuk-tag--yellow'
      },
      certified: {
        label: 'Certified',
        tagClass: 'govuk-tag--green'
      },
      uncertified: {
        label: 'Uncertified',
        tagClass: 'govuk-tag--grey'
      }
    },

    // Shown in the date column when a country has no certification date
    notCertifiedText: 'Not certified',

    // Appliance status (pending, live, hidden, rejected) with GOV.UK tag colors
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
      },
      rejected: {
        label: 'Rejected',
        tagClass: 'govuk-tag--red'
      }
    },

    // Rejected record metadata labels
    rejectedDetails: {
      dateRejected: 'Date rejected',
      rejectedBy: 'Rejected by',
      notSpecified: 'Not specified'
    },

    // Detail section items - references to related pages
    detailsItems: {
      applianceDetails: 'Appliance details',
      testResults: 'Test results',
      instructionManual: 'Instruction manual',
      applicationDetails: 'Application details',
      actionHistory: 'Action history'
    },

    formatApplicationDetailsLabel: (applicationId) =>
      applicationId
        ? `Application ${applicationId} details`
        : 'Application details',

    // Detail section items - references to related pages (Legacy records)
    legacyDetailsItems: {
      applianceDetails: 'Appliance details',
      manuals: 'Manuals',
      legacyComments: 'Legacy comments',
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
    backLinkText: 'Back',
    returnLink: 'Return to appliance records',

    // Error messages
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
