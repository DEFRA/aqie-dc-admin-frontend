import { fuelApplicationsContent } from './content.js'

const content = fuelApplicationsContent.en

/**
 * Builds the view model used by the fuel applications landing page.
 * @param {object} applications - The backend summary payload grouped by status.
 * @returns {{
 *   pageTitle: string,
 *   heading: string,
 *   content: object,
 *   notStartedApplications: Array,
 *   inProgressApplications: Array,
 *   breadcrumbs: Array,
 *   backLink: { href: string, text: string }
 * }} The page model for Nunjucks rendering.
 */
export function buildFuelApplicationsViewModel(applications) {
  return {
    pageTitle: content.pageTitle,
    heading: content.heading,
    content,
    notStartedApplications: applications.new,
    inProgressApplications: applications.inProgress,
    breadcrumbs: [
      {
        text: content.navigation.home,
        href: '/manage-certification'
      },
      {
        text: content.heading
      }
    ],
    backLink: {
      href: '/manage-certification',
      text: content.navigation.back
    }
  }
}

/**
 * Creates the reviewer payload expected by the backend from the current user.
 * Falls back to safe default values when the user object is incomplete.
 * @param {object} [user] - The authenticated user from the request context.
 * @returns {{ name: string, email: string }} The reviewer details used for audit metadata.
 */
export function buildFuelApplicationReviewer(user) {
  if (user?.name && user?.email) {
    return { name: user.name, email: user.email }
  }

  return {
    name: user?.name ?? content.reviewerFallback.name,
    email: user?.email ?? content.reviewerFallback.email
  }
}
