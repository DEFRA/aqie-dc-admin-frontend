/**
 * Appliance Record Controller
 *
 * Handles HTTP request/response for the appliance-record page.
 * Orchestrates data layer and view model preparation.
 *
 * Architecture:
 * 1. Request comes to handleGetApplianceRecordPage with applianceId param
 * 2. Calls getApplianceRecord (data layer) to fetch and transform backend data
 * 3. Builds view-specific data structures (certification rows, detail rows, buttons)
 * 4. Passes to template with all required context
 *
 * Key principles:
 * - All content/labels come from content.js (no hardcoding)
 * - Data transformation happens in data layer (appliance-record-data.js)
 * - Controller focuses on view model preparation
 * - Template is pure rendering (no logic beyond iteration/conditionals)
 */

import { createLogger } from '../common/helpers/logging/logger.js'
import { getApplianceRecord } from './appliance-record-data.js'
import { applianceRecordContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceRecordContent.en

/**
 * TESTING FLAG: Toggle this to test legacy vs non-legacy display
 * Set to true to display legacy record details
 * Set to false to display standard record details
 * TODO: Remove this and get isLegacyRecord from backend response once API is updated
 */
const IS_LEGACY_RECORD = false

/**
 * Returns the URL for appliance-records list page (return link destination).
 * @returns {string} Return URL path
 */
const buildReturnHref = () => '/appliance-records'

/**
 * Renders generic service error page with user-safe message.
 * Logs error without exposing internal details to user.
 *
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Error response with 500 status code
 */
const renderServiceError = (h) =>
  h
    .view('error/index', { message: content.errors.generic })
    .code(statusCodes.internalServerError)

/**
 * Build certification table rows for govukTable macro.
 *
 * Transforms appliance.certifications array into rows format:
 * [Country | Status (colored tag) | Date Certified | Change Link]
 *
 * Each row includes:
 * - Country name (text)
 * - Status with GOV.UK tag color (HTML)
 * - Date formatted DD/MM/YYYY or "Not certified" (text)
 * - Change link with visually-hidden descriptive text (HTML for screen readers)
 *
 * @param {Object} appliance - Transformed appliance data from data layer
 * @returns {Array} Array of row arrays, each containing 4 cell objects
 */
const buildCertificationTableRows = (appliance) =>
  appliance.certifications.map((cert) => {
    const statusTagColor = content.certificationStatus[cert.status]
    const dateText =
      cert.dateCertified || content.certificationStatus.notCertified.label
    return [
      { text: cert.country },
      {
        html: `<strong class="govuk-tag ${statusTagColor.tagClass}">${statusTagColor.label}</strong>`
      },
      { text: dateText },
      {
        html: `<a href="${cert.changeUrl}" class="govuk-link">${content.changeText}<span class="govuk-visually-hidden"> certification for ${cert.country}</span></a>`
      }
    ]
  })

/**
 * Build details rows for govukSummaryList macro (Non-Legacy records).
 *
 * Standard details for current appliance records:
 * - Appliance details
 * - Test results
 * - Instruction manual
 * - Application details (with application ID if available)
 * - Action history
 *
 * @param {string} applianceId - The appliance ID
 * @param {string} applicationId - The application ID (optional)
 * @returns {Array} Array of detail row objects
 */
const buildStandardDetailsRows = (applianceId, applicationId) => {
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
      label: applicationId
        ? `Application ${applicationId} details`
        : content.detailsItems.applicationDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/application-details`
    },
    {
      label: content.detailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/action-history`
    }
  ]

  return details.map((detail) => ({
    key: { text: detail.label },
    actions: {
      items: [
        {
          href: detail.viewUrl,
          text: content.actionText,
          visuallyHiddenText: detail.label.toLowerCase()
        }
      ]
    }
  }))
}

/**
 * Build details rows for govukSummaryList macro (Legacy records).
 *
 * Legacy details for historical appliance records:
 * - Appliance details
 * - Manuals
 * - Legacy comments
 * - Application details (with application ID if available)
 * - Action history
 *
 * Follows GOV.UK accessibility pattern for summary lists.
 *
 * @param {string} applianceId - The appliance ID
 * @param {string} applicationId - The application ID (optional)
 * @returns {Array} Array of detail row objects
 */
const buildLegacyDetailsRows = (applianceId, applicationId) => {
  const details = [
    {
      label: content.legacyDetailsItems.applianceDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/appliance-details`
    },
    {
      label: content.legacyDetailsItems.manuals,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/manuals`
    },
    {
      label: content.legacyDetailsItems.legacyComments,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/legacy-comments`
    },
    {
      label: applicationId
        ? `Application ${applicationId} details`
        : content.legacyDetailsItems.applicationDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/application-details`
    },
    {
      label: content.legacyDetailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/action-history`
    }
  ]

  return details.map((detail) => ({
    key: { text: detail.label },
    actions: {
      items: [
        {
          href: detail.viewUrl,
          text: content.actionText,
          visuallyHiddenText: detail.label.toLowerCase()
        }
      ]
    }
  }))
}

/**
 * Build details rows for govukSummaryList macro.
 *
 * Transforms appliance details into summary list rows based on record type.
 * Conditionally returns either standard or legacy details based on isLegacyRecord flag.
 *
 * Key (label) | Actions (View link with visually-hidden text)
 *
 * Each row includes:
 * - Key: detail label (includes application ID if available)
 * - Action: View link with screen-reader text
 *
 * Follows GOV.UK accessibility pattern for summary lists.
 *
 * @param {string} applianceId - The appliance ID
 * @param {boolean} isLegacyRecord - Whether this is a legacy record
 * @param {string} applicationId - The application ID (optional)
 * @returns {Array} Array of row objects with key and actions
 */
const buildDetailsRows = (applianceId, isLegacyRecord, applicationId) =>
  isLegacyRecord
    ? buildLegacyDetailsRows(applianceId, applicationId)
    : buildStandardDetailsRows(applianceId, applicationId)

/**
 * Build public listing configuration for the public listing section.
 *
 * Determines whether to show the "View public listing" link.
 * Only shown for live appliances.
 *
 * Returns object with:
 * - showLink: boolean indicating if public listing section should render
 * - url: link to public listing (if shown)
 * - linkText: from content.js (user-facing text)
 *
 * @param {Object} appliance - Transformed appliance data from data layer
 * @returns {Object} Public listing configuration object
 */
const buildPublicListing = (appliance) => {
  const showLink = appliance.applianceStatus === 'live'
  return {
    showLink,
    url: showLink ? appliance.publicListingUrl : null,
    linkText: content.viewPublicListingText
  }
}

/**
 * Build action buttons configuration for appliance visibility toggle.
 *
 * Determines which buttons to display based on appliance status:
 * - Live: Hide from public (secondary)
 * - Hidden + toggle permission: Make appliance live (secondary)
 * - Pending or Hidden without toggle: no buttons
 *
 * Each button includes:
 * - text: from content.js (user-facing text)
 * - href: generated URL for action
 * - classes: GOV.UK classes (primary or secondary)
 *
 * Follows GOV.UK button styling guidelines.
 *
 * @param {Object} appliance - Transformed appliance data from data layer
 * @returns {Object} Actions configuration with buttons array
 */
const buildActions = (appliance) => {
  const buttons = []

  if (appliance.buttons.hideFromPublic) {
    buttons.push({
      text: content.hideFromPublicText,
      href: appliance.hideFromPublicUrl,
      classes: 'govuk-button govuk-button--secondary'
    })
  }

  if (appliance.buttons.makePublic) {
    buttons.push({
      text: content.makePublicText,
      href: appliance.makePublicUrl,
      classes: 'govuk-button'
    })
  }

  return { buttons }
}

/**
 * Loads and renders the appliance-record view page for a single appliance.
 *
 * Process:
 * 1. Extract applianceId from route params
 * 2. Call data layer to fetch and transform backend response
 * 3. Build view-specific structures (table rows, detail rows, buttons)
 * 4. Render template with complete context
 * 5. On error: log and render generic error page (no internal details to user)
 *
 * Displays:
 * - Appliance status tag with color (yellow/green/grey per GOV.UK)
 * - Certification status for all 4 countries (with change links)
 * - Detail items with view links (appliance, tests, manual, application, history)
 * - Visibility toggle buttons (if applicable for status)
 * - Return link to appliance records list
 *
 * @param {Object} request - Hapi request object with params.applianceId
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Rendered view or error response
 */
export const handleGetApplianceRecordPage = async (request, h) => {
  const { applianceId } = request.params

  try {
    const applianceRecord = await getApplianceRecord(applianceId)

    if (!applianceRecord.success) {
      logger.error(
        `[applianceRecord] Failed to load appliance record for ${applianceId}: ${applianceRecord.message}`
      )
      return renderServiceError(h)
    }

    const { data: appliance } = applianceRecord

    return h.view('appliance-record/index', {
      ...content,
      pageTitle: content.pageTitle(appliance.modelName),
      pageHeading: content.pageHeading(appliance.modelName),
      statusDisplay: appliance.statusDisplay,
      applianceStatus: appliance.applianceStatus,
      tableHeaders: content.tableHeaders,
      certificationTableRows: buildCertificationTableRows(appliance),
      publicListing: buildPublicListing(appliance),
      detailsRows: buildDetailsRows(
        appliance.id,
        IS_LEGACY_RECORD,
        appliance.applicationId
      ),
      actions: buildActions(appliance),
      returnLinkUrl: buildReturnHref(),
      returnLinkText: content.returnLink,
      detailsTitle: content.detailsTitle,
      appliance
    })
  } catch (error) {
    logger.error(
      `[applianceRecord] Failed to load appliance record for ${applianceId}: ${error.message}`
    )
    return renderServiceError(h)
  }
}

export const applianceRecordController = {
  handler: handleGetApplianceRecordPage
}
