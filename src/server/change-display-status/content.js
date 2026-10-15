/**
 * Content file for the appliance public visibility page.
 *
 * This keeps user-facing strings in the content layer instead of the controller,
 * which keeps the wiring consistent with the rest of the frontend architecture.
 */
export const changeDisplayStatusContent = {
  en: {
    pageTitle: 'Change display status',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    cancel: 'Cancel',
    defaultModelName: 'appliance',
    errors: {
      generic: 'Sorry, there is a problem with the service'
    },
    /**
     * Builds the heading based on the current visibility state.
     *
     * @param {string} modelName - The appliance model name to render.
     * @param {boolean} isVisibleToPublic - The current public visibility state.
     * @returns {string} The rendered heading.
     */
    heading: (modelName, isVisibleToPublic) =>
      isVisibleToPublic
        ? `Hide ${modelName} from public list`
        : `Make ${modelName} live on public list`,
    /**
     * Builds the explanatory paragraph for the current state.
     *
     * @param {boolean} isVisibleToPublic - The current public visibility state.
     * @returns {string} The describes the current status.
     */
    description: (isVisibleToPublic) =>
      isVisibleToPublic
        ? 'This appliance is currently appearing on the public list.'
        : 'This appliance is currently hidden from the public list.',
    /**
     * Builds the yes/no confirmation question for the current state.
     *
     * @param {boolean} isVisibleToPublic - The current public visibility state.
     * @returns {string} The question displayed to the user.
     */
    question: (isVisibleToPublic) =>
      isVisibleToPublic
        ? 'Should this appliance be hidden from the public list?'
        : 'Should this appliance be made live on the public list?',
    /**
     * Builds the radio button list so the user can choose the final state.
     *
     * The values are intentionally boolean-like strings because the form posts as a
     * simple form payload and the controller converts them to actual booleans.
     *
     * @param {boolean} isVisibleToPublic - The current public visibility state.
     * @returns {Array<object>} GOV.UK radio button items.
     */
    visibilityItems: (isVisibleToPublic) =>
      isVisibleToPublic
        ? [
            { value: 'false', text: 'Yes' },
            { value: 'true', text: 'No' }
          ]
        : [
            { value: 'true', text: 'Yes' },
            { value: 'false', text: 'No' }
          ]
  }
}
