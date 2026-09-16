export const checkApplianceDetailsContent = {
  en: {
    heading: (modelName) => `Check appliance details for ${modelName}`,
    markAsCompleted: 'Mark as completed',
    cancel: 'Cancel',
    labels: {
      modelName: 'Model name',
      modelNumber: 'Model number (optional)',
      applianceType: 'Appliance type',
      otherApplianceType: 'Other appliance type',
      isVariant: 'Is it a variant of a certified appliance?',
      variantDetails: 'Variant details',
      nominalOutput: 'Nominal (thermal) output',
      multifuelAppliance: 'Is it a multifuel appliance?'
    },
    actions: {
      change: 'Change',
      add: 'Add',
      select: 'Select'
    },
    notProvided: 'Not provided',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    }
  }
}
