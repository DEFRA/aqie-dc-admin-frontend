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
 * 1. Calls backend /admin-appliances/{id} endpoint
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
 *   - success: boolean
 *   - data: Object with id, modelName, applianceStatus, statusDisplay, buttons, URLs, etc.
 *   - message: error message if success=false
 */
export async function getApplianceRecord(applianceId) {
  const response = await fetchJson(
    `/admin-appliances/${encodeURIComponent(applianceId)}`
  )

  if (!response.success) {
    return {
      success: false,
      message: response.message || 'Failed to load appliance record'
    }
  }

  const { data } = response

  /**
   * Transform backend certifications to frontend format with country names,
   * status labels, formatted dates, and change URLs.
   * Countries are ordered: England, Scotland, Wales, Northern Ireland (per content.js)
   */
  const certifications = Object.entries(content.countries).map(
    ([countryKey, countryName]) => {
      const certification = data.certifications[countryKey] || {}
      const certStatusLabel =
        STATUS_LABEL_MAP[certification.status] || certification.status

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

  /**
   * Get appliance status display from content mapping.
   * Defaults to 'pending' status if status not in map or missing.
   */
  const STATUS_DISPLAY_MAP = {
    pending: {
      label: 'Pending government approval',
      tagClass: 'govuk-tag--yellow'
    },
    live: { label: 'Live on public list', tagClass: 'govuk-tag--green' },
    hidden: { label: 'Hidden from public list', tagClass: 'govuk-tag--grey' },
    rejected: { label: 'Rejected', tagClass: 'govuk-tag--red' }
  }

  // Ensure we have a valid status value
  const applianceStatus = data.applianceStatus || 'pending'
  let applianceStatusData = STATUS_DISPLAY_MAP[applianceStatus]

  // Fallback to pending if status not found
  if (!applianceStatusData) {
    console.warn(
      `[appliance-record-data] Status '${applianceStatus}' not found in status map, using pending fallback`
    )
    applianceStatusData = {
      label: 'Pending government approval',
      tagClass: 'govuk-tag--yellow'
    }
  }

  // Validate status display data
  if (!applianceStatusData?.label || !applianceStatusData?.tagClass) {
    throw new Error(
      `[appliance-record-data] Invalid status display data: ${JSON.stringify(applianceStatusData)}`
    )
  }

  /**
   * Determine which buttons to display based on appliance status and visibility toggle permission.
   * AC4 Dev Note: Show hide button if canToggleVisibility is true AND isVisibleToPublic is true
   * - Live status: show View listing link (always), hide button (if canToggleVisibility)
   * - Hidden with toggle: show Make Public button
   * - Pending or Hidden without toggle: no buttons
   */
  const buttons = {}
  if (data.applianceStatus === 'live') {
    buttons.showPublicListing = true
    if (data.canTogglePublicVisibility) {
      buttons.hideFromPublic = true
    }
  } else if (
    data.applianceStatus === 'hidden' &&
    data.canTogglePublicVisibility
  ) {
    buttons.makePublic = true
  }

  /**
   * Build detail items array with labels from content.js and generated URLs.
   * Application number is dynamic from backend data (AC10 requirement).
   */
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
      label: data.applicationId
        ? `Application ${data.applicationId} details`
        : content.detailsItems.applicationDetails || 'Application details',
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/application-details`
    },
    {
      label: content.detailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/action-history`
    }
  ]

  return {
    success: true,
    data: {
      id: data.id,
      modelName: data.modelName || 'Unknown model',
      applianceStatus: data.applianceStatus,
      statusDisplay: {
        label: applianceStatusData.label,
        tagClass: applianceStatusData.tagClass
      },
      canTogglePublicVisibility: data.canTogglePublicVisibility || false,
      buttons,
      publicListingUrl: `/appliance-list/${encodeURIComponent(applianceId)}`,
      hideFromPublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/hide-from-public`,
      makePublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/make-public`,
      certifications,
      details
    }
  }
}
