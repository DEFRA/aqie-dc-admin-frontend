import { fetchJson, patchJson } from '../common/api/api.js'

const CHECK = 'permittedFuels'

export async function getApplianceForPermittedFuels(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

export async function savePermittedFuels(applianceId, permittedFuels, wood) {
  // Single backend operation through the existing checks route.
  // For this check, backend validates and applies both appliance fields and
  // technical-review status/check updates atomically in one update call.
  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    {
      check: CHECK,
      result: true,
      data: {
        permittedFuels,
        isPermittedToBurnWood: wood
      }
    }
  )
}
