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
 * Build standard details rows for govukSummaryList macro.
 *
 * Standard details for current appliance records:
 * - Appliance details
 * - Test results
 * - Instruction manual
 * - Application details (with application ID if available)
 * - Action history
 *
 * @param {Object} appliance - The transformed appliance data
 * @returns {Array} Array of detail row objects
 */
const buildStandardDetailsRows = (appliance) =>
  appliance.details.map((detail) => ({
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

/**
 * Build legacy details rows for govukSummaryList macro.
 *
 * Legacy details for historical appliance records include the legacy-specific values.
 *
 * @param {Object} appliance - The transformed appliance data
 * @returns {Array} Array of detail row objects
 */
const buildLegacyDetailsRows = (appliance) => {
  const details = [
    {
      label: content.legacyDetailsItems.applianceDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/appliance-details`
    },
    {
      label: content.legacyDetailsItems.manuals,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/manuals`
    },
    {
      label: content.legacyDetailsItems.legacyComments,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/legacy-comments`
    },
    {
      label: appliance.applicationId
        ? `Application ${appliance.applicationId} details`
        : content.legacyDetailsItems.applicationDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/application-details`
    },
    {
      label: content.legacyDetailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/action-history`
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
 * Build rejected details rows for govukSummaryList macro.
 *
 * Adds rejection metadata rows before the standard or legacy detail rows.
 *
 * @param {Object} appliance - The transformed appliance data
 * @returns {Array} Array of row objects
 */
const buildRejectedDetailsRows = (appliance) => {
  const rejectedRows = [
    {
      key: { text: content.rejectedDetails.dateRejected },
      value: {
        text: appliance.updatedAt
          ? new Date(appliance.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          : null
      }
    },
    {
      key: { text: content.rejectedDetails.rejectedBy },
      value: {
        text: appliance.technicalReview?.reviewedBy || 'Unknown'
      }
    }
  ]

  const remainingRows = appliance.isLegacyRecord
    ? buildLegacyDetailsRows(appliance)
    : buildStandardDetailsRows(appliance)

  return [...rejectedRows, ...remainingRows]
}

/**
 * Build details rows for govukSummaryList macro.
 *
 * @param {Object} appliance - The transformed appliance data
 * @returns {Array} Array of row objects with key and actions
 */
const buildDetailsRows = (appliance) => {
  if (appliance.applianceStatus === content.statusValues.rejected) {
    return buildRejectedDetailsRows(appliance)
  }

  return appliance.isLegacyRecord
    ? buildLegacyDetailsRows(appliance)
    : buildStandardDetailsRows(appliance)
}

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
  const showLink = appliance.applianceStatus === content.statusValues.live
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
      applianceStatus: appliance.applianceStatus,
      rejectedStatus: content.statusValues.rejected,
      backLinkText: content.backLinkText,
      statusDisplay: appliance.statusDisplay,
      tableHeaders: content.tableHeaders,
      certificationTableRows: buildCertificationTableRows(appliance),
      publicListing: buildPublicListing(appliance),
      detailsRows: buildDetailsRows(appliance),
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
