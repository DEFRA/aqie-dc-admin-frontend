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
 * Saves the additional conditions text as a completed listing check.
 * This page always marks the check as complete when the user clicks the save button.
 */
export async function saveAdditionalConditions(
  applianceId,
  additionalConditions
) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true,
      data: {
        additionalConditions
      }
    }
  )
}
