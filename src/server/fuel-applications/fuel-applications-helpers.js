import { fuelApplicationsContent } from './content.js'

const content = fuelApplicationsContent.en

export function normaliseApplicationsSummary(response) {
  const data = response?.data ?? {}

  return {
    new: Array.isArray(data.new) ? data.new : [],
    inProgress: Array.isArray(data.inProgress) ? data.inProgress : []
  }
}

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

export function buildFuelApplicationReviewer(user) {
  if (user?.name && user?.email) {
    return { name: user.name, email: user.email }
  }

  return {
    name: user?.name ?? content.reviewerFallback.name,
    email: user?.email ?? content.reviewerFallback.email
  }
}
