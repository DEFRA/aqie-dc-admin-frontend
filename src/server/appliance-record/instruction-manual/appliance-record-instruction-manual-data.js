import { fetchJson } from '../../common/api/api.js'

/**
 * Fetches the full appliance record by ID.
 * Used to retrieve instructionManual and servicingManual fields.
 * Uses /admin/appliances/{id} to ensure full access to all appliance data.
 */
export async function getApplianceForInstructionManual(applianceId) {
  return fetchJson(`/admin/appliances/${encodeURIComponent(applianceId)}`)
}
