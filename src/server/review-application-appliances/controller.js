import { appliancesApplicationContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceApplication } from './application-data.js'
//updateApplianceApplicationStatus
import { statusCodes } from '../common/constants/status-codes.js'
import { applianceApplicationsContent } from '../applications-appliances/content.js'

const logger = createLogger()

async function handleAppliancesApplicationRequest(request, h) {
  const { applicationId } = request.params

  try {
    const response = await getApplianceApplication(applicationId)
    const application = response.data

    // // If this is first time arrving on this page for the application, need to assign the reviewer and start teh application review
    // const isNotStarted = application.linkedItems.every(
    //   (item) => (item.application?.status ?? 'new') === 'new'
    // )

    // if (isNotStarted) {
    //   await updateApplianceApplicationStatus(applicationId, 'in_review')
    // }

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
        actionHref: `/review-individual-appliance/${appliance.id}`,
        actionText: statusMap[status].text
      }
    })

    return h.view('review-application-appliances/index', {
      pageTitle: appliancesApplicationContent.en.heading,
      heading: appliancesApplicationContent.en.heading,
      applicationId,
      application,
      appliances,
      companyAddress,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/dashboard'
        },
        {
          text: applianceApplicationsContent.en.heading,
          href: '/applications-appliances'
        },
        {
          text: appliancesApplicationContent.en.heading
        }
      ]
    })
  } catch (error) {
    logger.error(
      `[review-application-appliances.GET] failed: ${error.message}`,
      error
    )
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

const appliancesApplicationController = {
  handler: handleAppliancesApplicationRequest
}

export { handleAppliancesApplicationRequest, appliancesApplicationController }
