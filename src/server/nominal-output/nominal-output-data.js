import { fetchJson, patchJson } from '../common/api/api.js'

export function getApplianceForNominalOutput(applianceId) {
  return fetchJson(
    `/appliances/${encodeURIComponent(applianceId)}/technical-review`
  )
}

export function saveNominalOutput(applianceId, nominalOutput) {
  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, {
    nominalOutput
  })
}
