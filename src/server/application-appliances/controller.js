import { appliancesApplicationContent } from './content.js'

async function handleAppliancesApplicationRequest(_request, h) {
  // const { applicationId } = request.params

  return h.view('application-appliances/index', {
    pageTitle: appliancesApplicationContent.en.heading,
    heading: appliancesApplicationContent.en.heading,
    content: "hello"
    // applicationId: applicationId
  })
}

const appliancesApplicationController = {
  handler: handleAppliancesApplicationRequest
}

export { handleAppliancesApplicationRequest, appliancesApplicationController }