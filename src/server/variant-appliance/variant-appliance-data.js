import { patchJson } from '../common/api/api.js'
import { getApplianceTechnicalReview } from '../common/services/commonService.js'

export async function getApplianceForVariant(applianceId) {
  return getApplianceTechnicalReview(applianceId)
}

export async function saveVariantAppliance(applianceId, isVariant, details) {
  const payload = {
    isVariant
  }

  // Set existingAuthorisedAppliance based on variant selection
  if (isVariant && details) {
    payload.existingAuthorisedAppliance = details
  } else if (!isVariant) {
    // Clear the existing variant details when user selects NO
    payload.existingAuthorisedAppliance = null
  }

  return patchJson(`/appliances/${encodeURIComponent(applianceId)}`, payload)
}
