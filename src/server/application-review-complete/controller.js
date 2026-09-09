import { applicationReviewCompleteContent } from './content.js'

function handleApplicationReviewCompleteRequest(request, h) {
  const { applicationId } = request.params

  const content = applicationReviewCompleteContent.en

  return h.view('application-review-complete/index', {
    pageTitle: content.pageTitle,
    heading: content.heading,
    applicationId
  })
}

const applicationReviewCompleteController = {
  handler: handleApplicationReviewCompleteRequest
}

export {
  handleApplicationReviewCompleteRequest,
  applicationReviewCompleteController
}
