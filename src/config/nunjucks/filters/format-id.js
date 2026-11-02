/** Returns the last 4 digits of any id */
export function formatId(id) {
  if (id === undefined || id === null) {
    return id
  }
  const idString = String(id)
  return idString.slice(-4)
}
