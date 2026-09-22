export const content = {
  en: {
    getHeading: (applicationId) =>
      `Your review of application ${applicationId} is not complete`,
    getPageTitle: (applicationId) =>
      `Your review of application ${applicationId} is not complete`,
    introText:
      'You must make a final decision on each appliance before completing this application review.',
    returnLinkText: 'Return to application and complete reviews',
    getReturnLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`
  }
}
