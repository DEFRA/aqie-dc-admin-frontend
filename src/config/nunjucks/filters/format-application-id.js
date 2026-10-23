/** Strips the 4-digit prefix and hyphen from an application id, e.g. 7756-0001 -> 0001 */
export function formatApplicationId(applicationId) {
  if (applicationId === undefined || applicationId === null)
    return applicationId
  return String(applicationId).replace(/^\d{4}-/, '')
}
