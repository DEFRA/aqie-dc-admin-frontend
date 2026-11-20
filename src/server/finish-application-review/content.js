const journeys = {
  appliance: {
    unsuitableItemsHeading: 'Unsuitable appliances',
    unsuitableIntro:
      'Following technical review, the following appliance is not considered to be suitable for certification under the Clean Air Act 1993.',
    contactApplicantText:
      'You must contact the applicant to tell them about this decision.',
    suitableItemsHeading: 'Suitable appliances',
    suitableIntro:
      'Following technical review, the following appliance is considered to be suitable for certification under the Clean Air Act 1993.',
    approvalIntro:
      'This appliance can now be submitted to the governments of England, Scotland, Wales and Northern Ireland for approval.',
    finishReviewButton: 'Finish review',
    submitForApprovalButton: 'Submit for approval',
    returnLinkText: 'Return to application',
    returnLink: (applicationId) =>
      `/review-appliance-application/${applicationId}`
  },
  fuel: {
    unsuitableItemsHeading: 'Unsuitable fuels',
    unsuitableIntro:
      'Following technical review, the following fuel is not considered to be suitable for certification under the Clean Air Act 1993.',
    contactApplicantText:
      'You must contact the applicant to tell them about this decision.',
    suitableItemsHeading: 'Suitable fuels',
    suitableIntro:
      'Following technical review, the following fuel is considered to be suitable for certification under the Clean Air Act 1993.',
    approvalIntro:
      'This fuel can now be submitted to the governments of England, Scotland, Wales and Northern Ireland for approval.',
    finishReviewButton: 'Finish review',
    submitForApprovalButton: 'Submit for approval',
    returnLinkText: 'Go back',
    returnLink: (applicationId) => `/review-fuel-application/${applicationId}`
  }
}

export const finishApplicationReviewContent = {
  en: {
    heading: 'Finish application review',
    pageTitle: 'Finish application review',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}

export function getFinishApplicationReviewPageContent(applicationType) {
  const baseContent = finishApplicationReviewContent.en
  const journeyContent = journeys[applicationType]

  if (!journeyContent) {
    throw new Error(
      `Unsupported application type for finish review page: ${applicationType}`
    )
  }

  return {
    ...baseContent,
    ...journeyContent
  }
}
