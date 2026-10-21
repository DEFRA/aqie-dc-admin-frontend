import { fetchJson } from '../common/api/api.js'

/**
 * Fetches the full application payload for a fuel review. The backend owns the
 * data contract, including the `linkedItems` array used for fuel summaries.
 * The UI layer should consume that contract directly and only apply a minimal
 * defensive fallback for completely malformed responses.
 */
export async function getFuelApplicationDetails(applicationId) {
  const response = await fetchJson(
    `/applications/${encodeURIComponent(applicationId)}`
  )

  if (!response || typeof response !== 'object') {
    return { data: {} }
  }

  if ('data' in response) {
    return { ...response, data: response.data ?? {} }
  }

  return { data: response }
}
