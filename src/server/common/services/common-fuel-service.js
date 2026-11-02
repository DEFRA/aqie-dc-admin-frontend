import { fetchJson } from '../api/api.js'

export function getFuelTechnicalReview(fuelId) {
  return fetchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review`
  )
}
