import { fetchJson } from '../common/api/api.js'

/**
 * Backend contract for GET /admin/fuels/{id} (aqie-dc-backend getAdminFuelById).
 * Non-2xx responses (404 not found, 5xx) are thrown by fetchJson with `error.status`.
 *
 * @typedef {'awaiting_decision'|'certified'|'uncertified'} CertificationStatus
 * @typedef {{ status: CertificationStatus, firstCertifiedAt: string|null }} CountryCertification
 * @typedef {Object} AdminFuel
 * @property {string} id
 * @property {string} name - brandName, '' when missing
 * @property {string|null} applicationId
 * @property {'Manufacture'|'Rebrand'|null} supplierType
 * @property {'pending'|'live'|'hidden'|'rejected'} status
 * @property {{ england: CountryCertification, scotland: CountryCertification, wales: CountryCertification, northernIreland: CountryCertification }} certifications
 * @property {boolean} canTogglePublicVisibility
 * @property {boolean} isVisibleToPublic
 * @property {boolean} isLegacyRecord
 * @property {Object|null} technicalReview
 *
 * @typedef {{ success: true, data: AdminFuel }} AdminFuelSuccess
 * @typedef {{ success: false, message: string, notFound?: boolean }} AdminFuelFailure
 */

/**
 * Calls the backend admin fuel record endpoint and returns the response as-is.
 *
 * @param {string} fuelId
 * @returns {Promise<AdminFuelSuccess|AdminFuelFailure>}
 */
export async function getFuelRecord(fuelId) {
  return fetchJson(`/admin/fuels/${encodeURIComponent(fuelId)}`)
}
