import { fetchJson, patchJson } from '../common/api/api.js'

const CHECK = 'applianceDetails'

export async function getApplianceForCheckDetails(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

export async function markApplianceDetailsCompleted(applianceId) {
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true
    }
  )
}
