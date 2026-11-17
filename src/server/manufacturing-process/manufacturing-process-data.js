import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

export async function getManufacturingProcess(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function saveManufacturingProcess(fuelId, manufacturingProcess) {
  return patchJson(`/fuels/${encodeURIComponent(fuelId)}`, {
    manufacturingProcess
  })
}
