import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the dashboard counts from the backend
 */

export async function getCounts() {
  return fetchJson('/applications/counts')
}
