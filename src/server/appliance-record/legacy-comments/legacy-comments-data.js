import { fetchJson } from '../../common/api/api.js'

export async function getLegacyComments(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/legacy-comments`
  )
}
