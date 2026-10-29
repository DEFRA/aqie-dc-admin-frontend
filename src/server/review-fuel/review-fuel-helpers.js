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

export function buildDocumentationTasks(fuel) {
  const isManufacturer = isManufacturerFuel(fuel)

  return isManufacturer
    ? [
        {
          title: { text: content.manufacturerTaskTitle },
          href: content.links.testResults,
          status: { text: content.notReviewed }
        }
      ]
    : [
        {
          title: { text: content.rebrandTaskTitle },
          href: content.links.rebrandLetter,
          status: { text: content.notReviewed }
        }
      ]
}

export function buildListingTasks(fuel) {
  const isManufacturer = isManufacturerFuel(fuel)
  const tasks = [
    {
      title: { text: content.checkFuelDetailsTitle },
      href: content.links.fuelDetails,
      status: { text: content.notCompleted }
    }
  ]

  if (!isManufacturer) {
    tasks.push({
      title: { text: content.addFuelDescriptionTitle },
      href: content.links.fuelDescription,
      status: { text: content.notCompleted }
    })
  }

  return tasks
}

export function buildTasks(fuel) {
  const isManufacturer = isManufacturerFuel(fuel)

  return {
    isManufacturer,
    documentationHeading: isManufacturer
      ? content.manufacturerHeading
      : content.rebrandHeading,
    documentationTasks: buildDocumentationTasks(fuel),
    listingTasks: buildListingTasks(fuel)
  }
}

export function buildViewModel(fuel, fuelId) {
  const fuelName = fuel.name
  const isManufacturer = isManufacturerFuel(fuel)
  const applicationHref = fuel.applicationId
    ? `/review-fuel-application/${encodeURIComponent(fuel.applicationId)}`
    : '/fuel-applications'

  const { documentationHeading, documentationTasks, listingTasks } =
    buildTasks(fuel)

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
