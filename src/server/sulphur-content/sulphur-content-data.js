import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getSulphurContent(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

// Backend contract: fuelDescription.sulphurContent is Joi.number().strict()
// with min(0) and max(100), so a real number must be sent, not a string.
export async function saveSulphurContent(fuelId, sulphurContent) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    fuelDescription: { sulphurContent: Number(sulphurContent) }
  })
}
