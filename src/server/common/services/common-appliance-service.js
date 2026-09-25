import { fetchJson } from '../api/api.js'

export function getApplianceTechnicalReview(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}
