import { completeApplicationAppliancesContent } from './content.js'

function handleCompleteApplicationAppliancesRequest(request, h) {
  const { applicationId } = request.params

  return h.view('complete-application-appliances/index', {
    pageTitle: completeApplicationAppliancesContent.en.pageTitle,
    heading: completeApplicationAppliancesContent.en.heading,
    applicationId
  })
}

const completeApplicationAppliancesController = {
  handler: handleCompleteApplicationAppliancesRequest
}

export {
  handleCompleteApplicationAppliancesRequest,
  completeApplicationAppliancesController
}
