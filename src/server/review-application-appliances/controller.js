import { appliancesApplicationContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplication } from './application-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleAppliancesApplicationRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplianceApplication(applicationId)
    const application = response.data

    const companyAddress = application.companyFullAddress
      ? application.companyFullAddress
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [
          application.companyAddress.line1,
          application.companyAddress.line2,
          application.companyAddress.city,
          application.companyAddress.county,
          application.companyAddress.postcode,
          application.companyAddress.country
        ].filter(Boolean)

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

    const appliances = application.linkedItems.map((appliance) => {
      const status = appliance.technicalReview?.status ?? 'new'

      return {
        modelName: appliance.modelName,
        tag: statusMap[status],
        actionHref: `/review-appliance/${appliance.id}`,
        actionText: statusMap[status].text
      }
    })

    return h.view('review-application-appliances/index', {
      pageTitle: appliancesApplicationContent.en.heading,
      heading: appliancesApplicationContent.en.heading,
      application,
      appliances,
      companyAddress
    })
  } catch (error) {
    logger.error(`appliance applications get failed: ${error.message}`, error)
    return h
      .view('error/index', { message: '', details: error })
      .code(statusCodes.internalServerError)
  }
}

const appliancesApplicationController = {
  handler: handleAppliancesApplicationRequest
}

export { handleAppliancesApplicationRequest, appliancesApplicationController }
