import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'
import { reviewFuelApplicationContent } from './content.js'

const content = reviewFuelApplicationContent.en

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildApplicantSummaryRows(application) {
  const linkedItems = application?.linkedItems ?? []

  if (linkedItems.length === 0) {
    return []
  }

  const primaryFuel = linkedItems[0]
  const companyAddress = (primaryFuel.fullAddress ?? []).map(escapeHtml)

  return [
    {
      key: { text: content.labels.companyName },
      value: {
        text: primaryFuel.companyName ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.companyAddress },
      value: { html: companyAddress.join('<br>') }
    },
    {
      key: { text: content.labels.mainContactName },
      value: {
        text: primaryFuel.companyContact?.name ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactEmail },
      value: {
        text: primaryFuel.companyContact?.email ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactAlternativeEmail },
      value: {
        text:
          primaryFuel.companyContact?.alternativeEmail ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactPhone },
      value: {
        text: primaryFuel.companyContact?.phone ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.responsiblePerson },
      value: {
        text: primaryFuel.responsiblePerson?.name ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.responsiblePersonEmail },
      value: {
        text: primaryFuel.responsiblePerson?.email ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.customerComplaints },
      value: {
        text:
          primaryFuel.customerComplaints === true
            ? content.boolean.yes
            : primaryFuel.customerComplaints === false
              ? content.boolean.no
              : content.notProvided
      }
    },
    {
      key: { text: content.labels.fuelSalesMethod },
      value: {
        text: primaryFuel.fuelBagging ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.manufacturerOrRebrander },
      value: {
        text: content.supplierTypes[primaryFuel.supplierType]
      }
    }
  ]
}

export function buildFuelRows(linkedItems) {
  return linkedItems.map((fuel) => {
    const reviewStatus = fuel.technicalReview.status
    const statusMeta = content.statusTags[reviewStatus]

    return {
      brandName: fuel.name,
      statusLabel: statusMeta.label,
      statusColour: statusMeta.colour,
      actionText: statusMeta.text,
      actionHref: `/review-fuel/${encodeURIComponent(fuel.id)}`
    }
  })
}

export function buildFuelApplicationViewModel(application) {
  const linkedItems = application.linkedItems ?? []
  const formattedApplicationId = formatApplicationId(application.id)
  const heading = content.heading(formattedApplicationId)

  return {
    pageTitle: content.pageTitle(formattedApplicationId),
    heading,
    content,
    summaryRows: buildApplicantSummaryRows(application),
    fuelRows: buildFuelRows(linkedItems),
    tableCaption: content.table.caption(formattedApplicationId),
    breadcrumbs: [
      { text: content.navigation.home, href: '/manage-certification' },
      {
        text: content.navigation.fuelApplications,
        href: '/fuel-applications'
      },
      { text: heading }
    ],
    backLink: {
      href: '/fuel-applications',
      text: content.navigation.back
    },
    returnHref: '/fuel-applications',
    continueReviewHref: '/incomplete-review'
  }
}
