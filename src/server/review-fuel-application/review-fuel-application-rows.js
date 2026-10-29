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
  if (!application) {
    return []
  }

  const companyAddress = application.fullAddress.map(escapeHtml)

  return [
    {
      key: { text: content.labels.companyName },
      value: {
        text: application.companyName ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.companyAddress },
      value: { html: companyAddress.join('<br>') }
    },
    {
      key: { text: content.labels.mainContactName },
      value: {
        text: application.companyContact?.name ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactEmail },
      value: {
        text: application.companyContact?.email ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactAlternativeEmail },
      value: {
        text:
          application.companyContact?.alternativeEmail ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.mainContactPhone },
      value: {
        text: application.companyContact?.phone ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.responsiblePerson },
      value: {
        text: application.responsiblePerson?.name ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.responsiblePersonEmail },
      value: {
        text: application.responsiblePerson?.email ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.customerComplaints },
      value: {
        text:
          application.hasCustomerComplaintsSystem === true
            ? content.boolean.yes
            : application.hasCustomerComplaintsSystem === false
              ? content.boolean.no
              : content.notProvided
      }
    },
    {
      key: { text: content.labels.fuelSalesMethod },
      value: {
        text: application.fuelBagging ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.manufacturerOrRebrander },
      value: {
        text:
          content.supplierTypes[
            application.supplierType ?? application.linkedItems[0]?.supplierType
          ] ?? content.notProvided
      }
    }
  ]
}

export function buildFuelRows(linkedItems) {
  return linkedItems.map((fuel) => {
    // Same path for Manufacture and Rebrand: the backend must supply technicalReview on every linked item, no supplierType branching here.
    const reviewStatus = fuel.technicalReview.status
    const statusMeta = content.statusTags[reviewStatus]

    return {
      brandName: fuel.brandName,
      statusLabel: statusMeta.label,
      statusColour: statusMeta.colour,
      actionText: statusMeta.text,
      actionHref: `/review-fuel/${encodeURIComponent(fuel.id)}`
    }
  })
}

export function buildFuelApplicationViewModel(application) {
  const linkedItems = application.linkedItems
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
