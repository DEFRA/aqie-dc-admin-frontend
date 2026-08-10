import { applianceReviewContent } from './content.js'

async function handleReviewRequest(_request, h) {
  // const { applicationId } = request.params

 return h.view('appliances/appliance-review/index', {
    pageTitle: applianceReviewContent.en.pageTitle,
    heading: applianceReviewContent.en.heading,
    content: "hello"
    // applicationId: applicationId
  })
}

const applianceReviewController = {
  handler: handleReviewRequest
}

export { handleReviewRequest, applianceReviewController }