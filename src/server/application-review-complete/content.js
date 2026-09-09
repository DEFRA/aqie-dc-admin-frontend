export const applicationReviewCompleteContent = {
  en: {
    heading: 'Application review complete',
    pageTitle: 'Application review complete',
    applianceApplicationLinkText: 'Back to appliance application',
    applianceRecordsLinkText: 'Appliance records',
    dashboardLinkText: 'Back to dashboard',
    applianceApplicationLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`,
    applianceRecordsLink: '#',
    dashboardLink: '/manage-certification'
  }
}
