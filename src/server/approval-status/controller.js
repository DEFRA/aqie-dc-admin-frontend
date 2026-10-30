import { approvalStatusContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForApprovalStatus,
  updateCertificationStatus
} from './approval-status-data.js'
import {
  buildFormView,
  deriveNewStatus,
  getCurrentStatus
} from './approval-status-helper.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = approvalStatusContent.en.pages.approvalStatus

/**
 * GET handler - Display the approval status change form
 */
export const approvalsStatusController = {
  handler: async (request, h) => {
    const { applianceId, country } = request.params

    try {
      const response = await getApplianceForApprovalStatus(applianceId)

      if (!response?.data) {
        logger.warn(
          `Appliance not found for approval status page: ${applianceId}`
        )
        return h
          .view('error/index', {
            pageTitle: content.errorTitle,
            heading: content.errorTitle,
            message: content.errorLoadingAppliance
          })
          .code(statusCodes.notFound)
      }

      return h.view(
        'approval-status/index',
        buildFormView(response.data, applianceId, country)
      )
    } catch (error) {
      logger.error(
        `Error loading approval status page for ${applianceId}:`,
        error
      )
      return h
        .view('error/index', {
          pageTitle: content.errorTitle,
          heading: content.errorTitle,
          message: content.errorLoadingAppliance
        })
        .code(statusCodes.internalServerError)
    }
  }
}

/**
 * POST handler - Handle the approval status change form submission
 */
export const approvalsStatusDecisionController = {
  handler: async (request, h) => {
    const { applianceId, country } = request.params
    const { decision } = request.payload

    try {
      const response = await getApplianceForApprovalStatus(applianceId)

      if (!response?.data) {
        logger.warn(
          `Appliance not found for approval status update: ${applianceId}`
        )
        return h
          .view('error/index', {
            pageTitle: content.errorTitle,
            heading: content.errorTitle,
            message: content.errorLoadingAppliance
          })
          .code(statusCodes.notFound)
      }

      const appliance = response.data

      // Nothing selected: show the form again with a validation error
      if (!decision) {
        return h
          .view(
            'approval-status/index',
            buildFormView(appliance, applianceId, country, true)
          )
          .code(statusCodes.badRequest)
      }

      // If decision is 'no' (don't change), just redirect without updating
      if (decision === 'no') {
        return h.redirect(
          `/appliance-record/${encodeURIComponent(applianceId)}`
        )
      }

      // Otherwise, determine the new status and update
      const newStatus = deriveNewStatus(
        getCurrentStatus(appliance, country),
        decision
      )

      if (!newStatus) {
        logger.warn(
          `Could not derive new status: ${applianceId}, ${country}, ${decision}`
        )
        return h
          .view('error/index', {
            pageTitle: content.errorTitle,
            heading: content.errorTitle,
            message: content.errorUpdatingStatus
          })
          .code(statusCodes.badRequest)
      }

      // Get the logged-in user's info for decidedBy
      const decidedBy = {
        name: request.auth?.credentials?.name || 'System',
        email: request.auth?.credentials?.email || 'system@example.com'
      }

      // Submit the update to the backend
      await updateCertificationStatus(
        applianceId,
        country,
        newStatus,
        decidedBy
      )

      logger.info(
        `Certification status updated: ${applianceId} (${country}: ${newStatus})`
      )

      // Redirect back to the appliance record page
      return h.redirect(`/appliance-record/${encodeURIComponent(applianceId)}`)
    } catch (error) {
      logger.error(
        `Error updating certification status for ${applianceId}:`,
        error
      )
      return h
        .view('error/index', {
          pageTitle: content.errorTitle,
          heading: content.errorTitle,
          message: content.errorUpdatingStatus
        })
        .code(statusCodes.internalServerError)
    }
  }
}
