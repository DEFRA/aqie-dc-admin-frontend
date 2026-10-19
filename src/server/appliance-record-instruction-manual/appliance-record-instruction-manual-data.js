import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the full appliance record by ID.
 * Used to retrieve instructionManual and servicingManual fields.
 */
export async function getApplianceForInstructionManual(applianceId) {
  return fetchJson(`/appliances/${encodeURIComponent(applianceId)}`)
}
