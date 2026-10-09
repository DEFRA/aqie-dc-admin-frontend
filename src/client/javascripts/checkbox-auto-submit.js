/**
 * Auto-submit form when checkboxes change
 *
 * Reusable functionality for any form that needs to auto-submit
 * when filter checkboxes are changed.
 *
 * ⚠️  IMPORTANT: This only affects forms with data-auto-submit-on-change attribute
 *     Other forms and checkboxes are NOT affected.
 *
 * Usage: Add data-auto-submit-on-change attribute to any form
 * Example: <form data-auto-submit-on-change> ... </form>
 */

;(function () {
  // Only select forms that explicitly opt-in with data-auto-submit-on-change
  const forms = document.querySelectorAll('form[data-auto-submit-on-change]')

  forms.forEach((form) => {
    // Only find GOV.UK checkboxes within this form
    const checkboxes = form.querySelectorAll('.govuk-checkboxes__input')

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        form.submit()
      })
    })
  })
})()
