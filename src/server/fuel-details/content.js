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
      monitoredQualityControlSystem: 'Monitored quality control system'
    },
    resellerLabels: {
      rebrandedName: 'Rebranded name',
      additionalRebrandNamesQuestion:
        'Will the fuel be sold under any additional rebrand names?',
      additionalRebrandNames: 'Additional rebrand name(s)',
      originalFuelManufacturer: 'Original fuel manufacturer',
      originalFuelNameOrBrand: 'Original fuel name or brand',
      changesMadeToOriginalFuel: 'Changes made to original fuel',
      detailOfChanges: 'Detail of changes'
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
