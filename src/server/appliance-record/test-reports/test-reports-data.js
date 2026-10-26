import { fetchJson } from '../../common/api/api.js'

export async function getTestReports(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}
