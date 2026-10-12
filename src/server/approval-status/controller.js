import { approvalStatusContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForApprovalStatus,
  updateCertificationStatus
} from './approval-status-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = approvalStatusContent.en.pages.approvalStatus

// Map country path segment to full country name
const countryDisplayNames = {
  england: 'England',
  scotland: 'Scotland',
  wales: 'Wales',
  'northern-ireland': 'Northern Ireland'
}

/**
 * Get the certification field name for a country
 */
function getCertificationField(country) {
  const fieldMap = {
    england: 'englandCertification',
    scotland: 'scotlandCertification',
    wales: 'walesCertification',
    'northern-ireland': 'nIrelandCertification'
  }
  return fieldMap[country]
}

/**
 * Map user-facing status names to schema values
 */
function mapStatusForDisplay(schemaStatus) {
  const statusMap = {
    new: 'awaiting_decision',
    awaiting_decision: 'awaiting_decision',
    certified: 'certified',
    revoked: 'uncertified',
    rejected: 'uncertified'
  }
  return statusMap[schemaStatus] || schemaStatus
}

/**
 * Generate radio options based on current status
 */
function getRadioOptions(currentStatus, selectedValue = null) {
  const displayStatus = mapStatusForDisplay(currentStatus)

  if (displayStatus === 'certified') {
    // Certified: ask if they want to change to uncertified
    return [
      {
        value: 'yes',
        text: content.optionYes,
        checked: selectedValue === 'yes'
      },
      {
        value: 'no',
        text: content.optionNo,
        checked: selectedValue === 'no'
      }
    ]
  } else if (displayStatus === 'uncertified') {
    // Uncertified: ask if they want to change to certified
    return [
      {
        value: 'yes',
        text: content.optionYes,
        checked: selectedValue === 'yes'
      },
      {
        value: 'no',
        text: content.optionNo,
        checked: selectedValue === 'no'
      }
    ]
  } else if (displayStatus === 'awaiting_decision') {
    // Awaiting decision: ask them to select certified or uncertified
    return [
      {
        value: 'certified',
        text: content.optionCertified,
        checked: selectedValue === 'certified'
      },
      {
        value: 'uncertified',
        text: content.optionUncertified,
        checked: selectedValue === 'uncertified'
      }
    ]
  }

  return []
}

/**
 * Map display status to content key
 */
function getStatusContentKey(displayStatus) {
  const keyMap = {
    certified: 'statusCertified',
    uncertified: 'statusUncertified',
    awaiting_decision: 'statusAwaitingDecision'
  }
  return keyMap[displayStatus] || displayStatus
}

/**
 * Get the question text based on current status
 */
function getQuestion(currentStatus, country) {
  const displayStatus = mapStatusForDisplay(currentStatus)
  const countryDisplay = countryDisplayNames[country]

  if (displayStatus === 'certified') {
    return content.questionCertified(countryDisplay)
  } else if (displayStatus === 'uncertified') {
    return content.questionUncertified(countryDisplay)
  } else if (displayStatus === 'awaiting_decision') {
    return content.questionAwaitingDecision(countryDisplay)
  }

  return ''
}

/**
 * Convert yes/no response and awaiting_decision status to new certification status
 */
function deriveNewStatus(currentStatus, selectedValue) {
  const displayStatus = mapStatusForDisplay(currentStatus)

  if (displayStatus === 'certified') {
    // Certified: Yes means change to uncertified, No means stay certified
    return selectedValue === 'yes' ? 'uncertified' : 'certified'
  } else if (displayStatus === 'uncertified') {
    // Uncertified: Yes means change to certified, No means stay uncertified
    return selectedValue === 'yes' ? 'certified' : 'uncertified'
  } else if (displayStatus === 'awaiting_decision') {
    // Awaiting decision: select certified or uncertified
    return selectedValue
  }

  return null
}

/**
 * GET handler - Display the approval status change form
 */
export const approvalsStatusController = {
  handler: async (request, h) => {
    const { applianceId, country } = request.params

    try {
      const response = await getApplianceForApprovalStatus(applianceId)

      if (!response || !response.data) {
        logger.warn(
          `Appliance not found for approval status page: ${applianceId}`
        )
        return h
          .view('error/error', {
            pageTitle: content.errorTitle,
            heading: content.errorTitle,
            message: content.errorLoadingAppliance
          })
          .code(statusCodes.notFound)
      }

      const appliance = response.data

      const certificationField = getCertificationField(country)
      const certification = appliance[certificationField] || {}
      const currentStatus = certification.status || 'new'
      const displayStatus = mapStatusForDisplay(currentStatus)

      const countryDisplay = countryDisplayNames[country]
      
      // Choose heading based on current status
      const heading =
        currentStatus === 'awaiting_decision'
          ? content.setHeading(appliance.modelName, countryDisplay)
          : content.changeHeading(appliance.modelName, countryDisplay)
      
      const radioOptions = getRadioOptions(currentStatus)
      const question = getQuestion(currentStatus, country)
      const applianceRecordHref = `/appliance-record/${encodeURIComponent(applianceId)}`

      const statusContentKey = getStatusContentKey(displayStatus)
      const statusLabel = content[statusContentKey]
      const disclaimer = content.disclaimerText(countryDisplay)

      return h.view('approval-status/index', {
        pageTitle: heading,
        heading,
        content,
        appliance,
        country,
        countryDisplay,
        currentStatus: displayStatus,
        statusLabel,
        disclaimer,
        question,
        radioOptions,
        applianceRecordHref
      })
    } catch (error) {
      logger.error(
        `Error loading approval status page for ${applianceId}:`,
        error
      )
      return h
        .view('error/error', {
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

    logger.info(`[POST /approval-status] applianceId=${applianceId}, country=${country}, decision=${decision}`)

    try {
      const response = await getApplianceForApprovalStatus(applianceId)

      if (!response || !response.data) {
        logger.warn(
          `Appliance not found for approval status update: ${applianceId}`
        )
        return h
          .view('error/error', {
            pageTitle: content.errorTitle,
            heading: content.errorTitle,
            message: content.errorLoadingAppliance
          })
          .code(statusCodes.notFound)
      }

      const appliance = response.data

      const certificationField = getCertificationField(country)
      const certification = appliance[certificationField] || {}
      const currentStatus = certification.status || 'new'

      // If decision is 'no' (don't change), just redirect without updating
      if (decision === 'no') {
        return h.redirect(`/appliance-record/${encodeURIComponent(applianceId)}`)
      }

      // Otherwise, determine the new status and update
      const newStatus = deriveNewStatus(currentStatus, decision)

      if (!newStatus) {
        logger.warn(
          `Could not derive new status: ${applianceId}, ${country}, ${decision}`
        )
        return h
          .view('error/error', {
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
      logger.info(`[POST] Calling updateCertificationStatus with status=${newStatus}`)
      const updateResult = await updateCertificationStatus(applianceId, country, newStatus, decidedBy)
      logger.info(`[POST] Update response:`, updateResult)

      logger.info(
        `Certification status updated: ${applianceId} (${country}: ${newStatus})`
      )

      // Redirect back to the appliance record page
      logger.info(`[POST] Redirecting to /appliance-record/${applianceId}`)
      return h.redirect(`/appliance-record/${encodeURIComponent(applianceId)}`)
    } catch (error) {
      logger.error(
        `Error updating certification status for ${applianceId}:`,
        error
      )
      return h
        .view('error/error', {
          pageTitle: content.errorTitle,
          heading: content.errorTitle,
          message: content.errorUpdatingStatus
        })
        .code(statusCodes.internalServerError)
    }
  }
}
