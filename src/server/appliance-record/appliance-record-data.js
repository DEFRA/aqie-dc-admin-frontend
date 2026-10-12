import { fetchJson } from '../common/api/api.js'
import { applianceRecordContent } from './content.js'

const content = applianceRecordContent.en

/**
 * Maps backend certification status values to display labels.
 * Extracted from content layer for use in data transformation.
 */
const STATUS_LABEL_MAP = {
  awaiting_decision: 'Awaiting decision',
  certified: 'Certified',
  uncertified: 'Uncertified',
  not_certified: 'Not certified',
  rejected: 'Rejected'
}

/**
 * Formats a date string to readable format (DD/MM/YYYY), or null if not set.
 * Uses en-GB locale for UK date format compliance (GOV.UK standard).
 *
 * @param {string|null} dateString - ISO date string or null
 * @returns {string|null} Formatted date or null
 */
const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Fetches and transforms appliance record from backend API.
 *
 * This function:
 * 1. Calls backend /api/admin/appliances/{id} endpoint
 * 2. Transforms backend response to frontend format:
 *    - Maps country keys to display names (from content.js)
 *    - Maps certification statuses to display labels and tag colors (from content.js)
 *    - Formats dates to DD/MM/YYYY (GOV.UK standard)
 *    - Determines which buttons to show based on appliance status
 *    - Generates URLs for all navigation links
 * 3. Returns structured data ready for template rendering
 *
 * @param {string} applianceId - The appliance ID to retrieve (will be URL-encoded)
 * @returns {Promise<Object>} Success response with transformed appliance data or error object
 */
export async function getApplianceRecord(applianceId) {
  const response = await fetchJson(
    `/api/admin/appliances/${encodeURIComponent(applianceId)}`
  )

  if (!response.success) {
    return {
      success: false,
      message: response.message || 'Failed to load appliance record'
    }
  }

  const { data } = response

  const certifications = Object.entries(content.countries).map(
    ([countryKey, countryName]) => {
      const certification = data.certifications?.[countryKey] || {}
      const certStatusLabel =
        STATUS_LABEL_MAP[certification.status] ||
        certification.status ||
        'Not certified'

      return {
        country: countryName,
        status: certStatusLabel,
        dateCertified: certification.lastCertifiedAt
          ? formatDate(certification.lastCertifiedAt)
          : null,
        changeUrl: `/appliance-record/${encodeURIComponent(applianceId)}/certification/${countryKey}`
      }
    }
  )

  const applianceStatus =
    data.status || data.applianceStatus || content.statusValues.pending
  const baseStatusDisplay =
    content.applianceStatus[applianceStatus] || content.applianceStatus.pending
  const statusDisplay = { ...baseStatusDisplay }

  if (applianceStatus === content.statusValues.rejected) {
    statusDisplay.label = content.applianceStatus.rejected.label
    statusDisplay.tagClass = content.applianceStatus.rejected.tagClass
  }

  const buttons = {}
  if (applianceStatus === content.statusValues.live) {
    buttons.showPublicListing = true
    if (data.canTogglePublicVisibility) {
      buttons.hideFromPublic = true
    }
  } else if (
    applianceStatus === content.statusValues.hidden &&
    data.canTogglePublicVisibility
  ) {
    buttons.makePublic = true
  }

  const details = [
    {
      label: content.detailsItems.applianceDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/appliance-details`
    },
    {
      label: content.detailsItems.testResults,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/test-reports`
    },
    {
      label: content.detailsItems.instructionManual,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/instruction-manual`
    },
    {
      label: content.formatApplicationDetailsLabel(data.applicationId),
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/application-details`
    },
    {
      label: content.detailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/action-history`
    }
  ]

  const transformedData = {
    id: data.id,
    modelName: data.modelName || content.defaultModelName,
    applianceStatus,
    updatedAt: data.updatedAt || null,
    technicalReview: data.technicalReview || null,
    statusDisplay: {
      label: statusDisplay.label,
      tagClass: statusDisplay.tagClass
    },
    canTogglePublicVisibility: data.canTogglePublicVisibility || false,
    buttons,
    publicListingUrl: `/appliance-list/${encodeURIComponent(applianceId)}`,
    hideFromPublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/hide-from-public`,
    makePublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/make-public`,
    certifications,
    details
  }

  if (data.applicationId !== undefined) {
    transformedData.applicationId = data.applicationId
  }
  if (data.isLegacyRecord !== undefined) {
    transformedData.isLegacyRecord = data.isLegacyRecord
  }

  return {
    success: true,
    data: transformedData
  }
}
