// Only for the five fuel-description fields: rebrand fuels return to fuel-description, everything else to fuel-details.
export function getFuelDescriptionFieldReturnHref(fuel, fuelId) {
  const section =
    fuel.supplierType === 'Rebrand' ? 'fuel-description' : 'fuel-details'

  return `/review-fuel/${encodeURIComponent(fuelId)}/${section}`
}
