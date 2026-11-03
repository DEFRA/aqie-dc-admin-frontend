import { fetchJson, patchJson } from '../common/api/api.js'

export async function getFuelTechnicalReview(fuelId) {
    return fetchJson(`/fuels/${encodeURIComponent(fuelId)}/technical-review`)
}

export async function saveFuelTechnicalReview(fuelId, result, values = {}) {
    return patchJson(`/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`, {
        check: 'testResults',
        result,
        data: {
            testResults: {
                smokeEmission: values.smokeEmission ?? null,
                sulphurContent: values.sulphurContent ?? null
            }
        }
    })
}
