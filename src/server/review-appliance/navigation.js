import { applianceReviewContent } from './content.js'

const content = applianceReviewContent.en

export const applicationPath = (applicationId) =>
  `/review-appliance-application/${encodeURIComponent(applicationId)}`

export const appliancePath = (applianceId) =>
  `/review-appliance/${encodeURIComponent(applianceId)}`

export const incompleteReviewPath = (applianceId) =>
  `${appliancePath(applianceId)}/incomplete-review`

/**
 * Breadcrumb trail shared by the appliance review page and its incomplete-review
 * page. `linkAppliance` adds an href to the final crumb, for pages where the
 * appliance review is no longer the current page.
 */
export function buildApplianceBreadcrumbs(
  appliance,
  { linkAppliance = false } = {}
) {
  return [
    { text: 'Home', href: '/manage-certifications' },
    { text: content.applicationsHeading, href: '/appliance-applications' },
    {
      text: `Review appliance application ${appliance.applicationId}`,
      href: applicationPath(appliance.applicationId)
    },
    {
      text: content.heading(appliance.modelName),
      ...(linkAppliance && { href: appliancePath(appliance.id) })
    }
  ]
}
