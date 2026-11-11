// Backend contract: fuelDescription is null until the first field is added; manufacturingProcess sits on the fuel itself.
export const FUEL_DESCRIPTION_FIELDS = [
  {
    key: 'appearance',
    labelKey: 'fuelAppearance',
    path: 'fuel-appearance',
    getValue: (fuel) => fuel.fuelDescription?.appearance
  },
  {
    key: 'weight',
    labelKey: 'fuelWeight',
    path: 'fuel-weight',
    getValue: (fuel) => fuel.fuelDescription?.weight
  },
  {
    key: 'composition',
    labelKey: 'fuelComposition',
    path: 'fuel-composition',
    getValue: (fuel) => fuel.fuelDescription?.composition
  },
  {
    key: 'sulphurContent',
    labelKey: 'sulphurContent',
    path: 'sulphur-content',
    getValue: (fuel) => fuel.fuelDescription?.sulphurContent
  },
  {
    key: 'manufacturingProcess',
    labelKey: 'manufacturingProcess',
    path: 'manufacturing-process',
    getValue: (fuel) => fuel.manufacturingProcess
  }
]

export const getFuelDescriptionFieldHref = (field, fuelId) =>
  `/review-fuel/${encodeURIComponent(fuelId)}/${field.path}`
