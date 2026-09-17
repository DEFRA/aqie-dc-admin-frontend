import { fetchJson, patchJson } from '../common/api/api.js'

export async function getApplianceForModelName(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

export async function saveModelName(applianceId, modelName) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    modelName
  })
}
