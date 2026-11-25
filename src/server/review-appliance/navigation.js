import { applianceReviewContent } from './content.js'
import { formatApplicationId } from '../../config/nunjucks/filters/format-application-id.js'

const content = applianceReviewContent.en

export const applicationPath = (applicationId) =>
  `/review-appliance-application/${encodeURIComponent(applicationId)}`

export const appliancePath = (applicationId, applianceId) =>
  `${applicationPath(applicationId)}/review-appliance/${encodeURIComponent(applianceId)}`

export const appliancePagePath = (applicationId, applianceId, page) =>
  `${appliancePath(applicationId, applianceId)}/${page}`

export const applianceDetailsPath = (applicationId, applianceId) =>
  appliancePagePath(applicationId, applianceId, 'appliance-details')

export const applianceDetailsFieldPath = (applicationId, applianceId, field) =>
  `${applianceDetailsPath(applicationId, applianceId)}/${field}`

export const incompleteReviewPath = (applicationId, applianceId) =>
  appliancePagePath(applicationId, applianceId, 'incomplete-review')

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
    { text: 'Home', href: '/manage-certification' },
    { text: content.applicationsHeading, href: '/appliance-applications' },
    {
      text: `Review appliance application ${formatApplicationId(appliance.applicationId)}`,
      href: applicationPath(appliance.applicationId)
    },
    {
      text: content.heading(appliance.modelName),
      ...(linkAppliance && {
        href: appliancePath(appliance.applicationId, appliance.id)
      })
    }
  ]
}
