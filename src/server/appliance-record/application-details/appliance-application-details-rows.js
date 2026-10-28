import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { applianceApplicationDetailsContent } from './content.js'

const content = applianceApplicationDetailsContent.en

/**
 * Backend contract: /appliances/{id} returns fullAddress as a pre-formatted,
 * newline-separated string. Only split it into trimmed display lines.
 */
function buildAddressLines(appliance) {
  return (appliance.fullAddress ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Builds the govukSummaryList value object for the appliances bullet list.
 */
export function buildAppliancesValue(appliances) {
  const items = (appliances ?? [])
    .map((a) => `<li>${escapeHtml(a.modelName)}</li>`)
    .join('')
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
  const ids = Array.isArray(linkedApplicationIds)
    ? linkedApplicationIds
    : [linkedApplicationIds]

  if (ids.length === 1) return { text: ids[0] }

  const allButLast = ids.slice(0, -1).join(', ')
  return { text: `${allButLast} and ${ids[ids.length - 1]}` }
}

/**
 * Address lines are joined with <br> inside an html value, so each line is
 * escaped first.
 */
function buildAddressHtml(addressLines) {
  return addressLines.map(escapeHtml).join('<br>')
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

  const addressLines = buildAddressLines(appliance)

  if (addressLines.length) {
    rows.push(
      {
        key: { text: content.labels.companyName },
        value: { text: appliance.companyName }
      },
      {
        key: { text: content.labels.companyAddress },
        value: { html: buildAddressHtml(addressLines) }
      }
    )
  } else {
    rows.push({
      key: { text: content.labels.company },
      value: { text: appliance.companyName }
    })
  }

  return rows
}

export function buildSummaryRows(appliance, application) {
  const addressLines = buildAddressLines(appliance)

  return [
    {
      key: { text: content.labels.applicationDate },
      value: {
        text: application.submittedAt
          ? formatDate(application.submittedAt, 'd MMMM yyyy')
          : undefined
      }
    },
    {
      key: { text: content.labels.companyName },
      value: { text: appliance.companyName }
    },
    {
      key: { text: content.labels.companyAddress },
      value: { html: buildAddressHtml(addressLines) }
    },
    {
      key: { text: content.labels.mainContactName },
      value: { text: appliance.companyContact?.name }
    },
    {
      key: { text: content.labels.mainContactEmail },
      value: { text: appliance.companyContact?.email }
    },
    {
      key: { text: content.labels.mainContactAlternativeEmail },
      value: { text: appliance.companyContact?.alternativeEmail }
    },
    {
      key: { text: content.labels.mainContactPhone },
      value: { text: appliance.companyContact?.phone }
    },
    {
      key: { text: content.labels.appliancesInApplication },
      value: buildAppliancesValue(application.linkedItems)
    }
  ]
}
