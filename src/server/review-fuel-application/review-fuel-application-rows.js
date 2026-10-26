import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'
import { reviewFuelApplicationContent } from './content.js'

const content = reviewFuelApplicationContent.en

function getPrimaryFuel(application) {
  return application?.linkedItems?.[0] ?? {}
}

function buildBooleanValue(value) {
  if (typeof value === 'boolean') {
    return value ? content.boolean.yes : content.boolean.no
  }

  return content.notProvided
}

function buildCompanyAddress(application) {
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

function buildManufacturerOrResellerValue(fuel) {
  return (
    fuel?.manufacturerOrReseller ?? fuel?.supplierType ?? content.notProvided
  )
}

export function buildApplicantSummaryRows(application) {
  const primaryFuel = getPrimaryFuel(application)
  const companyAddress = buildCompanyAddress(primaryFuel)

  return [
    {
      key: { text: content.labels.companyName },
      value: {
        text: primaryFuel.companyName ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.companyAddress },
      value: companyAddress.length
        ? { html: companyAddress.join('<br>') }
        : { text: content.notProvided }
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
        text: buildBooleanValue(primaryFuel.customerComplaints)
      }
    },
    {
      key: { text: content.labels.fuelSalesMethod },
      value: {
        text: primaryFuel.fuelBagging ?? content.notProvided
      }
    },
    {
      key: { text: content.labels.manufacturerOrReseller },
      value: {
        text: buildManufacturerOrResellerValue(primaryFuel)
      }
    }
  ]
}

export function buildFuelRows(linkedItems, _applicationId) {
  return linkedItems.map((fuel) => {
    const reviewStatus = fuel?.technicalReview?.status ?? 'new'
    const statusMeta =
      reviewFuelApplicationContent.en.statusTags[reviewStatus] ??
      reviewFuelApplicationContent.en.statusTags.new
    const fuelId = fuel?.fuelId ?? fuel?.id

    return {
      brandName:
        fuel?.brandNames ?? fuel?.fuelDescription ?? content.notProvided,
      statusLabel: statusMeta.label,
      statusColour: statusMeta.colour,
      actionText: statusMeta.text,
      actionHref: fuelId
        ? `/review-fuel/${encodeURIComponent(fuelId)}`
        : '/fuel-applications'
    }
  })
}

export function buildFuelApplicationViewModel(application, applicationId) {
  const linkedItems = application?.linkedItems ?? []
  const formattedApplicationId = formatApplicationId(
    application?.id ?? applicationId
  )
  const heading = content.heading(formattedApplicationId)

  return {
    pageTitle: content.pageTitle(formattedApplicationId),
    heading,
    content,
    summaryRows: buildApplicantSummaryRows(application),
    fuelRows: buildFuelRows(linkedItems, applicationId),
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
