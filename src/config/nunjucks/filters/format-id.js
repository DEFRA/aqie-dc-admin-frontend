/** Strips the 4-digit random prefix and hyphen from an id, e.g. 7756-0001 -> 0001 */
export function formatId(id) {
  if (id === undefined || id === null) {
    return id
  }
  return String(id).replace(/^\d{4}-/, '')
}
