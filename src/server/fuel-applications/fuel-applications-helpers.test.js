import { describe, expect, test } from 'vitest'
import {
  buildFuelApplicationReviewer,
  buildFuelApplicationsViewModel
} from './fuel-applications-helpers.js'
import { fuelApplicationsContent } from './content.js'

const content = fuelApplicationsContent.en

describe('buildFuelApplicationsViewModel', () => {
  test('maps applications and content into the view model', () => {
    const applications = { new: [{ id: 1 }], inProgress: [{ id: 2 }] }

    const result = buildFuelApplicationsViewModel(applications)

    expect(result.pageTitle).toBe(content.pageTitle)
    expect(result.heading).toBe(content.heading)
    expect(result.notStartedApplications).toBe(applications.new)
    expect(result.inProgressApplications).toBe(applications.inProgress)
    expect(result.backLink.href).toBe('/manage-certification')
    expect(result.breadcrumbs).toHaveLength(2)
  })
})

describe('buildFuelApplicationReviewer', () => {
  test('returns user details when name and email exist', () => {
    expect(
      buildFuelApplicationReviewer({ name: 'A User', email: 'a@example.com' })
    ).toEqual({ name: 'A User', email: 'a@example.com' })
  })

  test('falls back to defaults when user is missing', () => {
    expect(buildFuelApplicationReviewer()).toEqual({
      name: content.reviewerFallback.name,
      email: content.reviewerFallback.email
    })
  })

  test('keeps partial user details and fills the rest', () => {
    expect(buildFuelApplicationReviewer({ name: 'A User' })).toEqual({
      name: 'A User',
      email: content.reviewerFallback.email
    })
  })
})
