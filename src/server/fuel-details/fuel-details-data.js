import { fetchJson } from '../common/api/api.js'

export async function getFuelDetails(fuelId) {
  return fetchJson(`/fuels/${encodeURIComponent(fuelId)}`)
}
