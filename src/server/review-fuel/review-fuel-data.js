import { fetchJson, patchJson } from '../common/api/api.js'

/**
 * Fetch a single fuel record from the backend.
 * The frontend intentionally keeps the contract as returned by the API and only
 * uses supplierType to decide which task list to render.
 */
export async function getFuelReview(fuelId) {
  return fetchJson(`/fuels/${encodeURIComponent(fuelId)}`)
}

/**
 * Records the reviewer decision for a fuel.
 * `status` should be either 'accepted' or 'rejected'.
 */
export async function saveFuelReview(fuelId, status, reviewedBy) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}/technical-review`, {
    status,
    reviewedBy
  })
}
