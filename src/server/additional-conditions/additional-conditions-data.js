import { fetchJson, patchJson } from '../common/api/api.js'

const CHECK = 'additionalConditions'

/**
 * Fetches the appliance data needed for the additional-conditions review screen.
 */
export async function getAppliance(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

/**
 * Saves the additional conditions completion state.
 */
export async function saveAdditionalConditions(applianceId, result) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    { check: CHECK, result }
  )
}
