import { fetchJson, patchJson } from '../../common/api/api.js'

export async function getFuelAppearance(fuelId) {
  return fetchJson(`/fuels/${encodeURIComponent(fuelId)}/technical-review`)
}

export async function saveFuelAppearance(fuelId, appearance) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    fuelDescription: { appearance }
  })
}
