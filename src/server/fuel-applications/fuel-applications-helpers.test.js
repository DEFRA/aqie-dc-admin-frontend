import { describe, expect, test } from 'vitest'
import {
  buildFuelApplicationReviewer,
  buildFuelApplicationsViewModel
} from './fuel-applications-helpers.js'
import { fuelApplicationsContent } from './content.js'

const content = fuelApplicationsContent.en

describe('buildFuelApplicationsViewModel', () => {
  test('maps applications and content into the view model', () => {
    const applications = {
      new: [{ id: 'fuel-001', items: [{ name: 'Diesel' }] }],
      inProgress: [
        {
          id: 'fuel-002',
          items: [{ name: 'Petrol' }],
          reviewedBy: { name: 'Jane Doe' }
        }
      ]
    }

    const result = buildFuelApplicationsViewModel(applications)

    expect(result.pageTitle).toBe(content.pageTitle)
    expect(result.heading).toBe(content.heading)
    expect(result.notStartedApplications).toEqual(applications.new)
    expect(result.inProgressApplications).toEqual(applications.inProgress)
    expect(result.backLink).toEqual({
      href: '/manage-certification',
      text: 'Back'
    })
    expect(result.breadcrumbs).toHaveLength(2)
    expect(result.breadcrumbs[0]).toEqual({
      text: 'Home',
      href: '/manage-certification'
    })
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

  test('uses the authenticated user details when available', () => {
    const reviewer = buildFuelApplicationReviewer({
      name: 'Jane Doe',
      email: 'jane@example.com'
    })

    expect(reviewer).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com'
    })
  })

  test('falls back to safe defaults when user data is incomplete', () => {
    const reviewer = buildFuelApplicationReviewer({ name: 'Jane Doe' })

    expect(reviewer).toEqual({
      name: 'Jane Doe',
      email: 'unknown-reviewer@unknown.gov.uk'
    })

    expect(buildFuelApplicationReviewer(undefined)).toEqual({
      name: 'Unknown reviewer',
      email: 'unknown-reviewer@unknown.gov.uk'
    })
  })
})
