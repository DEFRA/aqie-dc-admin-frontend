/**
 * Controller for the appliance public visibility change flow.
 *
 * This feature follows the thin frontend pattern: the controller fetches the current
 * state, renders the confirmation page, and delegates the persistence to the backend API helper.
 */
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { changeDisplayStatusContent } from './content.js'
import {
  getApplianceVisibilityState,
  saveApplianceVisibility
} from './change-display-status-data.js'

const logger = createLogger()
const content = changeDisplayStatusContent.en

const applianceRecordPath = (applianceId) =>
  `/appliance-record/${encodeURIComponent(applianceId)}`

const changeDisplayStatusPath = (applianceId) =>
  `${applianceRecordPath(applianceId)}/change-display-status`

/**
 * Renders the yes/no confirmation screen for the current visibility state.
 *
 * @param {object} request - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 * @returns {object} The rendered page or redirect.
 */
export const handleGetChangeDisplayStatusPage = async (request, h) => {
  try {
    const { applianceId } = request.params || {}

    if (!applianceId) {
      return h.redirect('/appliance-records')
    }

    const response = await getApplianceVisibilityState(applianceId)
    const appliance = response?.data || {}
    const isVisibleToPublic = Boolean(appliance.isVisibleToPublic)
    const modelName = appliance.modelName || content.defaultModelName
    const returnHref = applianceRecordPath(applianceId)

    return h.view('change-display-status/index', {
      pageTitle: content.pageTitle,
      heading: content.heading(modelName, isVisibleToPublic),
      description: content.description(isVisibleToPublic),
      question: content.question(isVisibleToPublic),
      yesText: content.yes,
      noText: content.no,
      confirmText: content.confirm,
      cancelText: content.cancel,
      cancelHref: returnHref,
      formAction: changeDisplayStatusPath(applianceId),
      applianceId,
      isVisibleToPublic,
      visibilityItems: content.visibilityItems(isVisibleToPublic)
    })
  } catch (error) {
    logger.error(
      `[change-display-status.GET] Failed to render change display status page: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

/**
 * Saves the user's final selection and returns the user to the individual appliance record.
 *
 * @param {object} request - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 * @returns {object} Redirect back to the appliance record or an error page.
 */
export const handlePostChangeDisplayStatusPage = async (request, h) => {
  try {
    const { applianceId } = request.params || {}

    if (!applianceId) {
      return h.redirect('/appliance-records')
    }

    const rawValue = request.payload?.isVisibleToPublic
    const returnHref = applianceRecordPath(applianceId)

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return h.redirect(returnHref)
    }

    const isVisibleToPublic = rawValue === true || rawValue === 'true'

    await saveApplianceVisibility(applianceId, isVisibleToPublic)

    return h.redirect(returnHref)
  } catch (error) {
    logger.error(
      `[change-display-status.POST] Failed to submit change display status: ${error.message}`
    )
    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

export const changeDisplayStatusController = {
  handler: handleGetChangeDisplayStatusPage
}

export const changeDisplayStatusSubmitController = {
  handler: handlePostChangeDisplayStatusPage
}
