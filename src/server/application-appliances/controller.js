import { appliancesApplicationContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplication } from './application-data.js'

const logger = createLogger()

async function handleAppliancesApplicationRequest(_request, h) {
  try {
    const response = await getApplianceApplication(
      '362a9e68-1678-44b6-b8b6-c8d15b988694'
    )
    const application = response.data
    console.log('application', application)

    let companyAddress

    if (application.companyFullAddress) {
      companyAddress = application.companyFullAddress.replaceAll('\n', '<br>')
    } else {
      companyAddress = [
        application.companyAddress.line1,
        application.companyAddress.line2,
        application.companyAddress.line3,
        application.companyAddress.town,
        application.companyAddress.county,
        application.companyAddress.postcode,
        application.companyAddress.country
      ]
        .filter(Boolean)
        .join('<br>')
    }

    const statusMap = {
      new: {
        text: 'Start review',
        label: 'Not started',
        colour: 'govuk-tag--grey'
      },
      in_review: {
        text: 'Continue review',
        label: 'In progress',
        colour: 'govuk-tag--yellow'
      },
      accepted: {
        text: 'Edit review',
        label: 'Accepted',
        colour: 'govuk-tag--green'
      },
      rejected: {
        text: 'Edit review',
        label: 'Rejected',
        colour: 'govuk-tag--red'
      }
    }

    const appliances = application.linkedItems.map((item) => ({
      modelName: item.modelName,
      tag: statusMap[item.technicalReview.status],
      action: `<a href="/appliance-review">${statusMap[item.technicalReview.status].text}</a>`
    }))

    return h.view('application-appliances/index', {
      pageTitle: appliancesApplicationContent.en.heading,
      heading: appliancesApplicationContent.en.heading,
      application,
      appliances,
      companyAddress
    })
  } catch (error) {
    logger.error(`appliance applications get failed: ${error.message}`, error)
    return h.view('error/index', { message: '', details: error })
  }
}

const appliancesApplicationController = {
  handler: handleAppliancesApplicationRequest
}

export { handleAppliancesApplicationRequest, appliancesApplicationController }
