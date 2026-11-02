import { fetchJson, patchJson } from '../common/api/api.js'

export async function getFuelDetails(fuelId) {
  return fetchJson(`/fuels/${encodeURIComponent(fuelId)}`)
}

export async function saveFuelDetailsCheck(fuelId, check) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    { check, result: true }
  )
}
