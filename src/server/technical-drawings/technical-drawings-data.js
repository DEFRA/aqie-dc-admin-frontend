import { fetchJson, patchJson } from '../common/api/api.js'

const CHECK = 'technicalDrawings'

/**
 * Fetches the appliance so the heading can name it.
 */
export async function getAppliance(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

/**
 * Records whether the technical drawings passed.
 */
export async function saveTechnicalDrawings(applianceId, result) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    { check: CHECK, result }
  )
}
