import { SUPPLIER_TYPE } from '../constants/supplier-type.js'

// Only for the five fuel-description fields: rebrand fuels return to fuel-description, everything else to fuel-details.
export function getFuelDescriptionFieldReturnHref(fuel, fuelId) {
  const section =
    fuel.supplierType === SUPPLIER_TYPE.REBRAND
      ? 'fuel-description'
      : 'fuel-details'

  return `/review-fuel/${encodeURIComponent(fuelId)}/${section}`
}
