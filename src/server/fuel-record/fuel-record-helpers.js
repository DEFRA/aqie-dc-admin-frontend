import { fuelRecordContent } from './content.js'
import { formatDate } from '../../config/nunjucks/filters/format-date.js'

const content = fuelRecordContent.en
const DATE_FORMAT = 'd MMMM yyyy'

export const buildRecordHref = (fuelId) =>
  `/fuel-record/${encodeURIComponent(fuelId)}`

// Routes use kebab-case (northern-ireland); the data keys are camelCase.
const toCountrySlug = (countryKey) =>
  countryKey.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

// Guards rendering against values outside the backend contract, as appliance-record does:
// unknown fuel status -> pending, unknown certification status -> uncertified tag.
export const normalizeFuelStatus = (status) =>
  content.fuelStatus[status] ? status : content.statusValues.pending

export const getCertificationStatusDisplay = (status) =>
  content.certificationStatus[status] ?? content.certificationStatus.uncertified

// Backend contract guarantees all 4 countries with status + firstCertifiedAt.
export const buildCertificationTableRows = (fuelId, certifications) =>
  Object.entries(content.countries).map(([countryKey, country]) => {
    const { status, firstCertifiedAt } = certifications[countryKey]
    const tag = getCertificationStatusDisplay(status)
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

// Same shape as appliance-record's buildSubPageBreadcrumbs so fuel sub-pages can reuse it.
export const buildSubPageBreadcrumbs = (name, returnHref) => ({
  breadcrumbs: [
    { text: content.nav.home, href: content.nav.homeHref },
    { text: content.nav.fuelRecords, href: content.nav.fuelRecordsHref },
    { text: name, href: returnHref }
  ],
  returnToRecord: content.nav.returnToRecord
})

export const buildFuelRecordViewModel = (data) => {
  const fuel = {
    ...data,
    name: data.name || content.defaultName,
    status: normalizeFuelStatus(data.status)
  }
  const { breadcrumbs } = buildSubPageBreadcrumbs(
    fuel.name,
    buildRecordHref(fuel.id)
  )

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
    breadcrumbs,
    backLink: { text: content.backLinkText, href: content.nav.fuelRecordsHref },
    returnLinkUrl: content.nav.fuelRecordsHref,
    returnLinkText: content.returnLink
  }
}
