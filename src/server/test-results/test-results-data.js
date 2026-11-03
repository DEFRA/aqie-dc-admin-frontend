import { fetchJson, patchJson } from '../common/api/api.js'

export async function getFuelTechnicalReview(fuelId) {
  return fetchJson(`/fuels/${encodeURIComponent(fuelId)}/technical-review`)
}

const normaliseSavedValue = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null
  }

  return value
}

export async function saveFuelTechnicalReview(fuelId, result, values = {}) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    {
      check: 'testResults',
      result,
      data: {
        testResults: {
          smokeEmission: normaliseSavedValue(values.smokeEmission),
          sulphurContent: normaliseSavedValue(values.sulphurContent)
        }
      }
    }
  )
}
