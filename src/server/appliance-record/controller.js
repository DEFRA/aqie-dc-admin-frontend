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
import {
  buildActions,
  buildApplianceRecordData,
  buildCertificationTableRows,
  buildDetailsRows,
  buildPublicListing
} from './appliance-record-helpers.js'
import { applianceRecordContent } from './content.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = applianceRecordContent.en

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

    const appliance = buildApplianceRecordData(
      applianceId,
      applianceRecord.data
    )

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
