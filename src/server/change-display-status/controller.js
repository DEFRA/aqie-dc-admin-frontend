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

const buildViewModel = ({ applianceId, appliance, error }) => {
  const isVisibleToPublic = Boolean(appliance?.isVisibleToPublic)
  const modelName = appliance?.modelName || content.defaultModelName
  const heading = content.heading(modelName, isVisibleToPublic)

  return {
    pageTitle: error ? `Error: ${heading}` : content.pageTitle,
    heading,
    description: content.description(isVisibleToPublic),
    question: content.question(isVisibleToPublic),
    yesText: content.yes,
    noText: content.no,
    confirmText: content.confirm,
    cancelText: content.cancel,
    cancelHref: applianceRecordPath(applianceId),
    formAction: changeDisplayStatusPath(applianceId),
    applianceId,
    isVisibleToPublic,
    visibilityItems: content.visibilityItems(isVisibleToPublic),
    error: error && {
      field: error.field,
      message: error.message,
      href: error.href
    }
  }
}

/**
 * Renders the yes/no confirmation screen for the current visibility state.
 *
 * @param {object} request - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 * @returns {object} The rendered page or redirect.
 */
export const handleGetChangeDisplayStatusPage = async (request, h) => {
  try {
    const { applianceId } = request.params

    const response = await getApplianceVisibilityState(applianceId)
    const appliance = response?.data || {}

    return h.view(
      'change-display-status/index',
      buildViewModel({ applianceId, appliance })
    )
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
  const { applianceId } = request.params
  const { isVisibleToPublic } = request.payload

  if (isVisibleToPublic === undefined) {
    try {
      const response = await getApplianceVisibilityState(applianceId)
      const appliance = response?.data || {}

      const error = {
        field: 'isVisibleToPublic',
        message: content.errors.selectionRequired(
          Boolean(appliance.isVisibleToPublic)
        ),
        href: '#isVisibleToPublic'
      }
      return h
        .view(
          'change-display-status/index',
          buildViewModel({ applianceId, appliance, error })
        )
        .code(statusCodes.badRequest)
    } catch (error) {
      logger.error(
        `[change-display-status.POST] Failed to render selection error for ${applianceId}: ${error.message}`
      )
      return h
        .view('error/index', { message: content.errors.generic })
        .code(statusCodes.internalServerError)
    }
  }

  const user = request.auth?.credentials?.user

  if (!user?.name || !user?.email) {
    logger.warn(
      `[change-display-status.POST] missing reviewer name/email in auth credentials for ${applianceId}, falling back to unknown reviewer`
    )
  }

  const reviewedBy = {
    name: user?.name ?? 'Unknown reviewer',
    email: user?.email ?? 'unknown-reviewer@unknown.gov.uk'
  }

  try {
    await saveApplianceVisibility(
      applianceId,
      isVisibleToPublic === 'true',
      reviewedBy
    )

    return h.redirect(applianceRecordPath(applianceId))
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
