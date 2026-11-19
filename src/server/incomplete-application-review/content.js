const journeys = {
  appliance: {
    introText:
      'You must make a final decision on the appliance before completing your review.',
    returnLinkText: 'Return to application review',
    getReturnLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`
  },
  fuel: {
    introText:
      'You must make a final decision on the fuel before completing your review.',
    returnLinkText: 'Return to fuel review',
    getReturnLink: (applicationId) =>
      `/review-fuel-application/${applicationId}`
  }
}

export const content = {
  en: {
    heading: 'Review is not complete',
    pageTitle: 'Review is not complete',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}

export function getIncompleteApplicationReviewPageContent(applicationType) {
  const journeyContent = journeys[applicationType] ?? journeys.appliance

  return {
    ...content.en,
    ...journeyContent
  }
}
