export const approvalStatusContent = {
  en: {
    pages: {
      approvalStatus: {
        changeHeading: (modelName, country) =>
          `Change approval status in ${country} for ${modelName}`,
        setHeading: (modelName, country) =>
          `Set approval status in ${country} for ${modelName}`,
        currentStatusLabel: 'Current status:',
        statusCertified: 'Certified',
        statusUncertified: 'Uncertified',
        statusAwaitingDecision: 'Awaiting decision',
        // Disclaimer shown for all statuses
        disclaimerText: (country) =>
          `You must only change the appliance's approval status if instructed to do so by an appropriate representative of the ${country} government.`,
        // Dynamic questions based on current status
        questionCertified: (country) =>
          `Do you want to change the approval status for this appliance to uncertified in ${country}?`,
        questionUncertified: (country) =>
          `Do you want to change the approval status for this appliance to certified in ${country}?`,
        questionAwaitingDecision: (country) =>
          `What is the appliance's new approval status in ${country}?`,
        // Radio options
        optionYes: 'Yes',
        optionNo: 'No',
        optionCertified: 'Certified',
        optionUncertified: 'Uncertified',
        optionCertifiedHint: '{country} has approved the appliance',
        optionUncertifiedHint: '{country} has rejected the appliance',
        // Buttons
        buttonConfirm: 'Confirm',
        buttonSubmit: 'Change status',
        buttonCancel: 'Cancel',
        // Success/Error messages
        successMessage: (country) =>
          `Certification status updated for ${country}`,
        errorTitle: 'Error',
        errorSummaryTitle: 'There is a problem',
        errorSelectOption: 'Please select an Option',
        errorUpdatingStatus:
          'There was a problem updating the certification status',
        errorLoadingAppliance:
          'There was a problem loading the appliance details',
        // Appliance details
        modelNameLabel: 'Model name:',
        applianceRecordsLink: 'Back to appliance record'
      }
    }
  }
}
