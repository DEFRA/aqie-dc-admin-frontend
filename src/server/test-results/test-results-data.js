import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export { getFuelTechnicalReview }

export async function saveFuelTechnicalReview(fuelId, result, values = {}) {
  return patchJson(
    `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
    {
      check: 'testResults',
      result,
      data: {
        testResults: {
          smokeEmission: values.smokeEmission,
          sulphurContent: values.sulphurContent
        }
      }
    }
  )
}
