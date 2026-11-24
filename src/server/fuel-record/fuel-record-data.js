import { fetchJson } from '../common/api/api.js'

/**
 * Calls the backend admin fuel record endpoint and returns the response as-is.
 * The backend normalises the payload (status, certifications, visibility flags).
 *
 * @param {string} fuelId
 * @returns {Promise<Object>} The raw backend response payload
 */
export async function getFuelRecord(fuelId) {
  return fetchJson(`/admin/fuels/${encodeURIComponent(fuelId)}`)
}
