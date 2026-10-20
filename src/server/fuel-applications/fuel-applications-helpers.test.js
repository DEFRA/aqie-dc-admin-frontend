import { describe, expect, test } from 'vitest'
import {
  buildFuelApplicationReviewer,
  buildFuelApplicationsViewModel
} from './fuel-applications-helpers.js'

describe('fuel applications helpers', () => {
  test('builds the fuel applications view model with section data and navigation', () => {
    const viewModel = buildFuelApplicationsViewModel({
      new: [{ id: 'fuel-1' }],
      inProgress: [{ id: 'fuel-2' }]
    })

    expect(viewModel.pageTitle).toBe('Fuel applications')
    expect(viewModel.heading).toBe('Fuel applications')
    expect(viewModel.notStartedApplications).toEqual([{ id: 'fuel-1' }])
    expect(viewModel.inProgressApplications).toEqual([{ id: 'fuel-2' }])
    expect(viewModel.breadcrumbs).toEqual([
      {
        text: 'Home',
        href: '/manage-certification'
      },
      {
        text: 'Fuel applications'
      }
    ])
    expect(viewModel.backLink).toEqual({
      href: '/manage-certification',
      text: 'Back'
    })
  })

  test('uses the current user details when available', () => {
    expect(
      buildFuelApplicationReviewer({
        name: 'Jane Doe',
        email: 'jane.doe@gov.uk'
      })
    ).toEqual({
      name: 'Jane Doe',
      email: 'jane.doe@gov.uk'
    })
  })

  test('falls back to the default reviewer values when user details are missing', () => {
    expect(buildFuelApplicationReviewer({ name: 'Jane Doe' })).toEqual({
      name: 'Jane Doe',
      email: 'unknown-reviewer@unknown.gov.uk'
    })

    expect(buildFuelApplicationReviewer({ email: 'jane.doe@gov.uk' })).toEqual({
      name: 'Unknown reviewer',
      email: 'jane.doe@gov.uk'
    })

    expect(buildFuelApplicationReviewer(null)).toEqual({
      name: 'Unknown reviewer',
      email: 'unknown-reviewer@unknown.gov.uk'
    })
  })
})
