import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { valueText } from '../../appliance-details/appliance-summary-builder.js'
import { applianceApplicationDetailsContent } from './content.js'

const content = applianceApplicationDetailsContent.en

/**
 * Splits the full address string into trimmed, non-empty lines, falling
 * back to the structured address parts when no full address is available.
 * Reads from the appliance record, where company data lives.
 */
export function buildCompanyAddress(appliance) {
  if (appliance.companyFullAddress) {
    return appliance.companyFullAddress
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return [
    appliance.companyAddress?.line1,
    appliance.companyAddress?.line2,
    appliance.companyAddress?.city,
    appliance.companyAddress?.county,
    appliance.companyAddress?.postcode,
    appliance.companyAddress?.country
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
 * Builds the govukSummaryList value for linked legacy application IDs.
 * Single ID → plain text.
 * Multiple IDs → comma-separated with "and" before the last item.
 * e.g. "CAA-1, CAA-2 and CAA-3"
 */
function buildLinkedApplicationsValue(linkedApplicationIds) {
  if (!linkedApplicationIds?.length) return { text: content.notProvided }

  const ids = Array.isArray(linkedApplicationIds)
    ? linkedApplicationIds
    : [linkedApplicationIds]

  if (ids.length === 1) return { text: ids[0] }

  const allButLast = ids.slice(0, -1).join(', ')
  return { text: `${allButLast} and ${ids[ids.length - 1]}` }
}

export function buildLegacySummaryRows(appliance, application) {
  const rows = []

  if (application.legacy?.linkedApplicationIds?.length) {
    rows.push({
      key: { text: content.labels.linkedLegacyApplications },
      value: buildLinkedApplicationsValue(
        application.legacy.linkedApplicationIds
      )
    })
  }

  const addressLines = buildCompanyAddress(appliance)

  if (addressLines.length) {
    rows.push(
      {
        key: { text: content.labels.companyName },
        value: { text: appliance.companyName || content.notProvided }
      },
      {
        key: { text: content.labels.companyAddress },
        value: { html: addressLines.join('<br>') }
      }
    )
  } else {
    rows.push({
      key: { text: content.labels.company },
      value: { text: appliance.companyName || content.notProvided }
    })
  }

  return rows
}

export function buildSummaryRows(appliance, application) {
  const addressLines = buildCompanyAddress(appliance)

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
      value: { text: valueText(appliance.companyName) }
    },
    {
      key: { text: content.labels.companyAddress },
      value: addressLines.length
        ? { html: addressLines.join('<br>') }
        : { text: content.notProvided }
    },
    {
      key: { text: content.labels.mainContactName },
      value: { text: valueText(appliance.companyContact?.name) }
    },
    {
      key: { text: content.labels.mainContactEmail },
      value: { text: valueText(appliance.companyContact?.email) }
    },
    {
      key: { text: content.labels.mainContactAlternativeEmail },
      value: {
        text: appliance.companyContact?.alternativeEmail || content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactPhone },
      value: {
        text: appliance.companyContact?.phone || content.notProvided
      }
    },
    {
      key: { text: content.labels.appliancesInApplication },
      value: buildAppliancesValue(application.linkedItems)
    }
  ]
}
