import { SUPPLIER_TYPE } from '../common/constants/supplier-type.js'
import { reviewFuelContent } from './content.js'

const content = reviewFuelContent.en

/**
 * Builds the view model and supplier-specific task list for a fuel review page.
 * This keeps the request/response controller small and leaves all rendering logic
 * in a single helper that can be tested independently.
 */
export function isManufacturerFuel(fuel) {
  const supplierType = fuel.supplierType

  return supplierType === SUPPLIER_TYPE.MANUFACTURE
}

export function buildIncompleteReviewViewModel(fuel, fuelId) {
  const fuelName = fuel.name
  const reviewFuelHref = `/review-fuel/${encodeURIComponent(fuelId)}`
  const applicationHref = fuel.applicationId
    ? `/review-fuel-application/${encodeURIComponent(fuel.applicationId)}`
    : '/fuel-applications'

  return {
    pageTitle: content.incompleteReview.heading,
    heading: content.incompleteReview.heading,
    intro: content.incompleteReview.intro(fuelName),
    conditions: content.incompleteReview.conditions,
    returnLinkText: content.incompleteReview.returnLink(fuelName),
    returnHref: reviewFuelHref,
    backLink: { href: reviewFuelHref },
    breadcrumbs: [
      { text: content.navigation.home, href: '/manage-certification' },
      {
        text: content.navigation.fuelApplications,
        href: '/fuel-applications'
      },
      ...(fuel.applicationId
        ? [
            {
              text: content.incompleteReview.applicationBreadcrumb(
                fuel.applicationId
              ),
              href: applicationHref
            }
          ]
        : []),
      { text: fuelName, href: reviewFuelHref }
    ]
  }
}

export function buildDocumentationTasks(fuel, fuelId) {
  const isManufacturer = isManufacturerFuel(fuel)
  const technicalReview = fuel.technicalReview || {}
  const documentationChecks = technicalReview.documentationChecks || {}
  const testResultStatus = documentationChecks.testResults
  const manufacturerLetterStatus = documentationChecks.manufacturerLetter

  if (isManufacturer) {
    const status =
      testResultStatus === true
        ? content.documentationStatuses.passed
        : testResultStatus === false
          ? content.documentationStatuses.failed
          : content.documentationStatuses.notReviewed

    return [
      {
        title: { text: content.manufacturerTaskTitle },
        href: content.links.testResults(fuelId),
        status
      }
    ]
  }

  const manufacturerLetterDisplayStatus =
    manufacturerLetterStatus === true
      ? content.documentationStatuses.passed
      : manufacturerLetterStatus === false
        ? content.documentationStatuses.failed
        : content.documentationStatuses.notReviewed

  return [
    {
      title: { text: content.rebrandTaskTitle },
      href: content.links.manufacturerLetter(fuelId),
      status: manufacturerLetterDisplayStatus
    }
  ]
}

function buildFuelDetailsStatus(fuel) {
  const listingChecks = (fuel.technicalReview || {}).listingChecks || {}

  if (listingChecks.fuelDetails === true) {
    return { tag: { text: content.completed, classes: 'govuk-tag--green' } }
  }

  return { text: content.notCompleted }
}

function buildFuelDescriptionStatus(fuel) {
  const listingChecks = (fuel.technicalReview || {}).listingChecks || {}

  if (listingChecks.fuelDescription === true) {
    return { tag: { text: content.completed, classes: 'govuk-tag--green' } }
  }

  return { text: content.notCompleted }
}

export function buildListingTasks(fuel, fuelId) {
  const isManufacturer = isManufacturerFuel(fuel)
  const tasks = [
    {
      title: { text: content.checkFuelDetailsTitle },
      href: content.links.fuelDetails(fuelId),
      status: buildFuelDetailsStatus(fuel)
    }
  ]

  if (!isManufacturer) {
    tasks.push({
      title: { text: content.addFuelDescriptionTitle },
      href: content.links.fuelDescription(fuelId),
      status: buildFuelDescriptionStatus(fuel)
    })
  }

  return tasks
}

export function buildTasks(fuel, fuelId) {
  const isManufacturer = isManufacturerFuel(fuel)

  return {
    isManufacturer,
    documentationHeading: isManufacturer
      ? content.manufacturerHeading
      : content.rebrandHeading,
    documentationTasks: buildDocumentationTasks(fuel, fuelId),
    listingTasks: buildListingTasks(fuel, fuelId)
  }
}

export function buildViewModel(fuel, fuelId) {
  const fuelName = fuel.name
  const isManufacturer = isManufacturerFuel(fuel)
  const applicationHref = fuel.applicationId
    ? `/review-fuel-application/${encodeURIComponent(fuel.applicationId)}`
    : '/fuel-applications'

  const { documentationHeading, documentationTasks, listingTasks } = buildTasks(
    fuel,
    fuelId
  )

  const fuelActionPath = `/review-fuel/${encodeURIComponent(fuelId)}`

  return {
    pageTitle: content.heading(fuelName),
    heading: content.heading(fuelName),
    isManufacturer,
    content,
    fuelId,
    fuelReviewAction: fuelActionPath,
    documentationHeading,
    documentationTasks,
    listingTasks,
    breadcrumbs: [
      { text: content.navigation.home, href: '/manage-certification' },
      {
        text: content.navigation.fuelApplications,
        href: '/fuel-applications'
      },
      ...(fuel.applicationId
        ? [
            {
              text: content.incompleteReview.applicationBreadcrumb(
                fuel.applicationId
              ),
              href: applicationHref
            }
          ]
        : []),
      { text: fuelName, href: fuelActionPath }
    ],
    backLink: {
      href: applicationHref,
      text: content.navigation.back
    },
    returnHref: applicationHref
  }
}
