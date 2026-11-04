export const fuelDetailsContent = {
  en: {
    pageTitle: (brandName) => `Check fuel details for ${brandName}`,
    heading: (brandName) => `Check fuel details for ${brandName}`,
    manufacturerLabels: {
      brandName: 'Brand name',
      additionalBrandNamesQuestion:
        'Will the fuel be sold under any additional brand names?',
      additionalBrandNames: 'Additional brand name(s)',
      fuelAppearance: 'Fuel appearance',
      fuelWeight: 'Fuel weight',
      fuelComposition: 'Fuel composition',
      sulphurContent: 'Sulphur content',
      manufacturingProcess: 'Manufacturing process',
      hasQualityControlSystem: 'Monitored quality control system'
    },
    rebranderLabels: {
      brandName: 'Rebranded name',
      additionalBrandNamesQuestion:
        'Will the fuel be sold under any additional rebrand names?',
      additionalBrandNames: 'Additional rebrand name(s)',
      originalFuelManufacturer: 'Original fuel manufacturer',
      originalFuelName: 'Original fuel name or brand',
      isChangedOrMixed: 'Changes made to original fuel',
      changes: 'Detail of changes'
    },
    actions: {
      change: 'Change',
      markAsCompleted: 'Mark as completed',
      cancel: 'Cancel'
    },
    boolean: {
      yes: 'Yes',
      no: 'No'
    },
    notProvided: 'Not provided',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
