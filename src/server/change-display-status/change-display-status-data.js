/**
 * Data access layer for the public visibility toggle flow.
 *
 * The frontend reads the appliance's current visibility state from the admin endpoint
 * and submits the selected boolean value to the backend visibility patch endpoint.
 */
import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetches the current public visibility state for a single appliance.
 *
 * @param {string} applianceId - The appliance identifier to load.
 * @returns {Promise<object>} The admin appliance payload returned by the backend.
 */
export async function getApplianceVisibilityState(applianceId) {
  return fetchJson(`/api/admin/appliances/${encodeURIComponent(applianceId)}`)
}

/**
 * Saves the chosen visibility value for an appliance.
 *
 * The backend expects a boolean payload and is responsible for the actual domain update.
 *
 * @param {string} applianceId - The appliance identifier to update.
 * @param {boolean} isVisibleToPublic - Whether the appliance should appear on the public list.
 * @returns {Promise<object>} The backend response from the PATCH request.
 */
export async function saveApplianceVisibility(applianceId, isVisibleToPublic) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/visibility`,
    { isVisibleToPublic }
  )
}
