import { fuelRecordContent } from './content.js'
import { formatDate } from '../../config/nunjucks/filters/format-date.js'

const content = fuelRecordContent.en
const DATE_FORMAT = 'd MMMM yyyy'

export const buildRecordHref = (fuelId) =>
  `/fuel-record/${encodeURIComponent(fuelId)}`

// Routes use kebab-case (northern-ireland); the data keys are camelCase.
const toCountrySlug = (countryKey) =>
  countryKey.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

// Backend guarantees all 4 countries with status + firstCertifiedAt.
export const buildCertificationTableRows = (fuelId, certifications) =>
  Object.entries(content.countries).map(([countryKey, country]) => {
    const { status, firstCertifiedAt } = certifications[countryKey]
    const tag = content.certificationStatus[status]
    const changeUrl = `${buildRecordHref(fuelId)}/approval-status-${toCountrySlug(countryKey)}`

    return [
      { text: country },
      {
        html: `<strong class="govuk-tag ${tag.tagClass}">${tag.label}</strong>`
      },
      {
        text: firstCertifiedAt
          ? formatDate(firstCertifiedAt, DATE_FORMAT)
          : content.notCertifiedText
      },
      {
        html: `<a href="${changeUrl}" class="govuk-link">${content.changeText}<span class="govuk-visually-hidden">${content.changeHiddenText(country)}</span></a>`
      }
    ]
  })

export const buildDetailsRows = (fuel) => {
  const recordHref = buildRecordHref(fuel.id)
  const details = [
    {
      label: content.detailsItems.fuelDetails,
      href: `${recordHref}/fuel-details`
    }
  ]

  if (fuel.supplierType === content.supplierTypes.manufacture) {
    details.push({
      label: content.detailsItems.testResults,
      href: `${recordHref}/test-results`
    })
  }

  details.push(
    {
      label: content.formatApplicationDetailsLabel(
        fuel.applicationId,
        fuel.supplierType
      ),
      href: `${recordHref}/application-details`,
      hiddenText: 'application details'
    },
    {
      label: content.detailsItems.actionHistory,
      href: `${recordHref}/action-history`
    }
  )

  return details.map(({ label, href, hiddenText }) => ({
    key: { text: label },
    actions: {
      items: [
        {
          href,
          text: content.actionText,
          visuallyHiddenText: hiddenText ?? label.toLowerCase()
        }
      ]
    }
  }))
}

export const buildPublicListing = (fuel) => {
  const showLink = fuel.status === content.statusValues.live
  return {
    showLink,
    url: showLink ? `/fuel-list/${encodeURIComponent(fuel.id)}` : null,
    linkText: content.viewPublicListingText
  }
}

// AC4/AC5: hide when visible, make live when hidden - only if toggling is allowed.
export const buildActions = (fuel) => {
  if (!fuel.canTogglePublicVisibility) {
    return { buttons: [] }
  }

  const href = `${buildRecordHref(fuel.id)}/change-display-status`
  const button = fuel.isVisibleToPublic
    ? {
        text: content.hideFromPublicText,
        classes: 'govuk-button govuk-button--secondary'
      }
    : { text: content.makePublicText, classes: 'govuk-button' }

  return { buttons: [{ ...button, href }] }
}

export const buildBreadcrumbs = (fuel) => [
  { text: content.nav.home, href: content.nav.homeHref },
  { text: content.nav.fuelRecords, href: content.nav.fuelRecordsHref },
  { text: fuel.name, href: buildRecordHref(fuel.id) }
]

export const buildFuelRecordViewModel = (fuelId, data) => {
  const fuel = {
    ...data,
    id: data.id || fuelId,
    name: data.name || content.defaultName
  }

  return {
    pageTitle: content.pageTitle(fuel.name),
    fuel,
    statusDisplay: content.fuelStatus[fuel.status],
    publicListingTitle: content.publicListingTitle,
    certificationStatusTitle: content.certificationStatusTitle,
    detailsTitle: content.detailsTitle,
    tableHeaders: content.tableHeaders,
    certificationTableRows: buildCertificationTableRows(
      fuel.id,
      fuel.certifications
    ),
    publicListing: buildPublicListing(fuel),
    detailsRows: buildDetailsRows(fuel),
    actions: buildActions(fuel),
    breadcrumbs: buildBreadcrumbs(fuel),
    backLink: { text: content.backLinkText, href: content.nav.fuelRecordsHref },
    returnLinkUrl: content.nav.fuelRecordsHref,
    returnLinkText: content.returnLink
  }
}
