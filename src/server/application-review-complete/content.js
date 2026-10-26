import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'
export const applicationReviewCompleteContent = {
  en: {
    heading: 'Review complete',
    pageTitle: 'Review complete',
    description: (applicationId) =>
      `Your review of application ${formatApplicationId(applicationId)} is complete.`,
    applianceApplicationsLinkText: 'Return to appliance applications',
    applianceRecordsLinkText: 'Go to appliance records',
    dashboardLinkText: 'Return to dashboard',
    applianceApplicationLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`,
    applianceRecordsLink: '/appliance-records',
    dashboardLink: '/manage-certification'
  }
}
