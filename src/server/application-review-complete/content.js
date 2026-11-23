import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'

const journeys = {
  appliance: {
    applicationsLinkText: 'Return to appliance applications',
    recordsLinkText: 'Go to appliance records',
    applicationLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`,
    recordsLink: '/appliance-records'
  },
  fuel: {
    applicationsLinkText: 'Return to fuel applications',
    recordsLinkText: 'Go to fuel records',
    applicationLink: (applicationId) =>
      `/review-fuel-application/${applicationId}`,
    recordsLink: '/fuel-records'
  }
}

export const applicationReviewCompleteContent = {
  en: {
    heading: 'Review complete',
    pageTitle: 'Review complete',
    description: (applicationId) =>
      `Your review of application ${formatApplicationId(applicationId)} is complete.`,
    errors: {
      generic: 'Sorry, there is a problem with the service'
    },
    dashboardLinkText: 'Return to dashboard',
    dashboardLink: '/manage-certification'
  }
}

export function getApplicationReviewCompletePageContent(applicationType) {
  const baseContent = applicationReviewCompleteContent.en
  const journeyContent = journeys[applicationType]

  if (!journeyContent) {
    throw new Error(
      `Unsupported application type for review complete page: ${applicationType}`
    )
  }

  return {
    ...baseContent,
    ...journeyContent
  }
}
