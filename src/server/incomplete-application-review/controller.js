import { content } from './content.js'

function handleIncompleteApplicationReviewRequest(request, h) {
  const { applicationId } = request.params

  const pageContent = content.en
  const heading = pageContent.getHeading(applicationId)
  const pageTitle = pageContent.getPageTitle(applicationId)

  return h.view('incomplete-application-review/index', {
    pageTitle,
    heading,
    applicationId,
    introText: pageContent.introText,
    returnLinkText: pageContent.returnLinkText,
    returnLink: pageContent.getReturnLink(applicationId)
  })
}

const incompleteApplicationReviewController = {
  handler: handleIncompleteApplicationReviewRequest
}

export {
  handleIncompleteApplicationReviewRequest,
  incompleteApplicationReviewController
}
