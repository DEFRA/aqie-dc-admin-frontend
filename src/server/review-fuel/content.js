import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'

/**
 * Shared user-facing copy for the fuel review page.
 * Keep all route-specific strings here so the templates stay data-driven and the
 * task labels remain consistent across Manufacturer and Rebrand flows.
 */
export const reviewFuelContent = {
  en: {
    heading: (fuelName) => `Review ${fuelName}`,
    manufacturerHeading: 'Review test reports',
    rebrandHeading: 'Review letter from manufacturer',
    listingHeading: 'Prepare public listing',
    manufacturerTaskTitle: 'Add test results',
    rebrandTaskTitle: 'Review letter from original manufacturer',
    checkFuelDetailsTitle: 'Check fuel details',
    addFuelDescriptionTitle: 'Add fuel description',
    acceptButton: 'Accept fuel',
    rejectButton: 'Reject fuel',
    saveForLater: 'Save and come back later',
    notReviewed: 'Not reviewed',
    notCompleted: 'Not completed',
    applicationsHeading: 'Fuel applications',
    incompleteReview: {
      heading: 'Incomplete review',
      intro: (fuelName) =>
        `You cannot accept ${fuelName} for government approval until:`,
      conditions: [
        'test results have been added and marked as Passed',
        'fuel details review has been marked as Completed'
      ],
      returnLink: (fuelName) => `Return to ${fuelName} review`,
      applicationBreadcrumb: (applicationId) =>
        `Review fuel application ${formatApplicationId(applicationId)}`
    },
    navigation: {
      home: 'Home',
      fuelApplications: 'Fuel applications',
      back: 'Back'
    },
    links: {
      testResults: '/test-results',
      fuelDetails: '/fuel-details',
      rebrandLetter: '/review-manufacturer-letter',
      fuelDescription: '/fuel-description'
    },
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
