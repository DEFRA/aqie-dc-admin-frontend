import { fetchJson, patchJson } from '../common/api/api.js'

const CHECK = 'permittedFuels'

export async function getApplianceForPermittedFuels(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

export async function savePermittedFuels(applianceId, permittedFuels, wood) {
  await patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    permittedFuels,
    isPermittedToBurnWood: wood
  })

  return patchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review/checks`,
    { check: CHECK, result: true }
  )
}
