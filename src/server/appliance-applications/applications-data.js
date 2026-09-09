import { fetchJson } from '../common/api/api.js'

/**
 * Fetches appliance application split by review status.
 * returns promise{notStarted: Array, inProgress: Array}
 */

export async function getApplianceApplications() {
  return fetchJson('/applications/summary')
}
