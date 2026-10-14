import { formatDate } from '../../config/nunjucks/filters/format-date.js'
import { valueText } from '../appliance-details/appliance-summary-builder.js'
import { applianceApplicationDetailsContent } from './content.js'

const content = applianceApplicationDetailsContent.en

/**
 * Splits the full address string into trimmed, non-empty lines, falling
 * back to the structured address parts when no full address is available.
 */
export function buildCompanyAddress(application) {
  if (application.companyFullAddress) {
    return application.companyFullAddress
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return [
    application.companyAddress?.line1,
    application.companyAddress?.line2,
    application.companyAddress?.city,
    application.companyAddress?.county,
    application.companyAddress?.postcode,
    application.companyAddress?.country
  ].filter(Boolean)
}

/**
 * Builds the govukSummaryList value object for the appliances bullet list.
 */
export function buildAppliancesValue(appliances) {
  if (!appliances?.length) return { text: content.notProvided }

  const items = appliances.map((a) => `<li>${a.modelName}</li>`).join('')
  return {
    html: `<ul class="govuk-list govuk-list--bullet">${items}</ul>`
  }
}

/**
 * Combines company name and address lines into a single govukSummaryList value.
 */
function buildCompanyValue(application) {
  const addressLines = buildCompanyAddress(application)
  const allLines = [application.companyName, ...addressLines].filter(Boolean)

  if (!allLines.length) return { text: content.notProvided }
  return { html: allLines.join('<br>') }
}

/**
 * Builds the govukSummaryList value for linked legacy application IDs.
 * Single ID → plain text. Multiple IDs → bullet list.
 */
function buildLinkedApplicationsValue(linkedApplicationIds) {
  if (!linkedApplicationIds?.length) return { text: content.notProvided }

  const ids = Array.isArray(linkedApplicationIds)
    ? linkedApplicationIds
    : [linkedApplicationIds]

  if (ids.length === 1) return { text: ids[0] }

  const items = ids.map((id) => `<li>${id}</li>`).join('')
  return {
    html: `<ul class="govuk-list govuk-list--bullet">${items}</ul>`
  }
}

export function buildLegacySummaryRows(application) {
  return [
    {
      key: { text: content.labels.linkedLegacyApplications },
      value: buildLinkedApplicationsValue(
        application.legacy?.linkedApplicationIds
      )
    },
    {
      key: { text: content.labels.company },
      value: buildCompanyValue(application)
    }
  ]
}

export function buildSummaryRows(application) {
  const addressLines = buildCompanyAddress(application)

  return [
    {
      key: { text: content.labels.applicationDate },
      value: {
        text: application.submittedAt
          ? formatDate(application.submittedAt, 'd MMMM yyyy')
          : content.notProvided
      }
    },
    {
      key: { text: content.labels.companyName },
      value: { text: valueText(application.companyName) }
    },
    {
      key: { text: content.labels.companyAddress },
      value: addressLines.length
        ? { html: addressLines.join('<br>') }
        : { text: content.notProvided }
    },
    {
      key: { text: content.labels.mainContactName },
      value: { text: valueText(application.companyContact?.name) }
    },
    {
      key: { text: content.labels.mainContactEmail },
      value: { text: valueText(application.companyContact?.email) }
    },
    {
      key: { text: content.labels.mainContactAlternativeEmail },
      value: {
        text:
          application.companyContact?.alternativeEmail || content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactPhone },
      value: {
        text: application.companyContact?.phone || content.notProvided
      }
    },
    {
      key: { text: content.labels.appliancesInApplication },
      value: buildAppliancesValue(application.linkedItems)
    }
  ]
}
