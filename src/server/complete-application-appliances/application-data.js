import { fetchJson } from '../common/api/api.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Fetches application with grouped technology status.
 * @param {string} applicationId - The application ID
 * @returns {Promise<object>} Application data including groupedByTechReviewStatus
 */
export async function getApplicationWithTechStatus(applicationId) {
  const data = await fetchJson(
    `/applications/${applicationId}?include=groupedByTechReviewStatus`
  )
  logger.info(
    'Complete Application Appliances Data:',
    JSON.stringify(data, null, 2)
  )
  console.log('Complete Application Appliances Data:', data)
  return data
}
