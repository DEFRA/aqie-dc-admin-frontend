import { approvalStatusContent } from './content.js'

const content = approvalStatusContent.en.pages.approvalStatus

// Map country path segment to full country name
const countryDisplayNames = {
  england: 'England',
  scotland: 'Scotland',
  wales: 'Wales',
  'northern-ireland': 'Northern Ireland'
}

const certificationFields = {
  england: 'englandCertification',
  scotland: 'scotlandCertification',
  wales: 'walesCertification',
  'northern-ireland': 'nIrelandCertification'
}

const statusContentKeys = {
  certified: 'statusCertified',
  uncertified: 'statusUncertified',
  awaiting_decision: 'statusAwaitingDecision'
}

/**
 * Normalise stored status to the three supported display statuses
 */
function mapStatusForDisplay(schemaStatus) {
  const statusMap = {
    awaiting_decision: 'awaiting_decision',
    certified: 'certified',
    uncertified: 'uncertified'
  }
  return statusMap[schemaStatus] || 'awaiting_decision'
}

/**
 * Current certification status for a country; no record means awaiting a decision
 */
export function getCurrentStatus(appliance, country) {
  return appliance[certificationFields[country]]?.status || 'awaiting_decision'
}

/**
 * Generate radio options based on current status
 */
function getRadioOptions(currentStatus, selectedValue = null) {
  const option = (value, text) => ({
    value,
    text,
    checked: selectedValue === value
  })

  // Awaiting decision: pick certified or uncertified. Otherwise the user
  // confirms (yes) or declines (no) switching to the opposite status.
  if (mapStatusForDisplay(currentStatus) === 'awaiting_decision') {
    return [
      option('certified', content.optionCertified),
      option('uncertified', content.optionUncertified)
    ]
  }

  return [option('yes', content.optionYes), option('no', content.optionNo)]
}

/**
 * Get the question text based on current status
 */
function getQuestion(currentStatus, country) {
  const displayStatus = mapStatusForDisplay(currentStatus)
  const countryDisplay = countryDisplayNames[country]

  if (displayStatus === 'certified') {
    return content.questionCertified(countryDisplay)
  } else if (displayStatus === 'uncertified') {
    return content.questionUncertified(countryDisplay)
  } else if (displayStatus === 'awaiting_decision') {
    return content.questionAwaitingDecision(countryDisplay)
  }

  return ''
}

/**
 * Convert yes/no response and awaiting_decision status to new certification status
 */
export function deriveNewStatus(currentStatus, selectedValue) {
  const displayStatus = mapStatusForDisplay(currentStatus)

  if (displayStatus === 'certified') {
    // Certified: Yes means change to uncertified, No means stay certified
    return selectedValue === 'yes' ? 'uncertified' : 'certified'
  } else if (displayStatus === 'uncertified') {
    // Uncertified: Yes means change to certified, No means stay uncertified
    return selectedValue === 'yes' ? 'certified' : 'uncertified'
  } else if (displayStatus === 'awaiting_decision') {
    // Awaiting decision: select certified or uncertified
    return selectedValue
  }

  return null
}

/**
 * Build the view model for the approval status form.
 * With `showError` it carries the "nothing selected" validation error.
 */
export function buildFormView(
  appliance,
  applianceId,
  country,
  showError = false
) {
  const currentStatus = getCurrentStatus(appliance, country)
  const displayStatus = mapStatusForDisplay(currentStatus)
  const countryDisplay = countryDisplayNames[country]

  const heading =
    displayStatus === 'awaiting_decision'
      ? content.setHeading(appliance.modelName, countryDisplay)
      : content.changeHeading(appliance.modelName, countryDisplay)

  // The summary link must target the first radio, whose id differs by variant.
  const firstRadioHref =
    displayStatus === 'awaiting_decision'
      ? '#decision-certified'
      : '#decision-0'

  return {
    pageTitle: showError ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    country,
    countryDisplay,
    currentStatus: displayStatus,
    statusLabel: content[statusContentKeys[displayStatus]],
    disclaimer: content.disclaimerText(countryDisplay),
    question: getQuestion(currentStatus, country),
    radioOptions: getRadioOptions(currentStatus),
    applianceRecordHref: `/appliance-record/${encodeURIComponent(applianceId)}`,
    error: showError
      ? { message: content.errorSelectOption, href: firstRadioHref }
      : null
  }
}
