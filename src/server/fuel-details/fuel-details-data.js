import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

const MANUFACTURER_CHECKS = [
  'brandName',
  'additionalBrandNames',
  'fuelAppearance',
  'fuelWeight',
  'fuelComposition',
  'sulphurContent',
  'manufacturingProcess',
  'hasQualityControlSystem'
]

const REBRAND_CHECKS = [
  'brandName',
  'additionalBrandNames',
  'fuelDescription'
]

export async function getFuelDetails(fuelId) {
  return getFuelTechnicalReview(fuelId)
}

export async function markFuelDetailsCompleted(fuelId, supplierType) {
  const checks = supplierType === 'Rebrand' ? REBRAND_CHECKS : MANUFACTURER_CHECKS

  return Promise.all(
    checks.map((check) =>
      patchJson(
        `/fuels/${encodeURIComponent(fuelId)}/technical-review/checks`,
        {
          check,
          result: true
        }
      )
    )
  )
}
