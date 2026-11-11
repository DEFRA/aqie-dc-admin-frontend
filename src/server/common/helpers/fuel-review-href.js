// Backend contract: rebrand fuels are reviewed from fuel-description, all others from fuel-details.
export function getFuelReviewHref(fuel, fuelId) {
  const section =
    fuel.supplierType === 'Rebrand' ? 'fuel-description' : 'fuel-details'

  return `/review-fuel/${encodeURIComponent(fuelId)}/${section}`
}
