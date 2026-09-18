export const finishApplicationReviewContent = {
  en: {
    heading: 'Finish Application Review',
    pageTitle: 'Finish Application Review',
    unsuitableAppliancesHeading: 'Unsuitable appliances',
    unsuitableIntro:
      'Following technical review, the following appliance is not considered to be suitable for certification under the Clean Air Act 1993:',
    contactApplicantText:
      'You must contact the applicant to tell them about this decision.',
    suitableAppliancesHeading: 'Suitable appliances',
    suitableIntro:
      'Following technical review, the following appliance is considered to be suitable for certification under the Clean Air Act 1993:',
    approvalIntro:
      'This appliance can now be submitted to the governments of England, Scotland, Wales and Northern Ireland for approval.',
    finishReviewButton: 'Finish Review',
    submitForApprovalButton: 'Submit for approval',
    returnLinkText: 'Return to application',
    returnLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`,
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
