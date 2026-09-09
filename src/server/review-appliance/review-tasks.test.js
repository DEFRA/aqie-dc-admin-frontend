import { buildDocumentationTasks, buildListingTasks } from './review-tasks.js'

describe('#buildDocumentationTasks', () => {
  test('shows a green Passed tag for a check that has passed', () => {
    const tasks = buildDocumentationTasks(
      { documentationChecks: { testReports: true } },
      'APP-1'
    )

    expect(tasks[0].title.text).toBe('Review test reports')
    expect(tasks[0].status.tag).toEqual({
      text: 'Passed',
      classes: 'govuk-tag--green'
    })
  })

  test('shows a red Failed tag for a check that has failed', () => {
    const tasks = buildDocumentationTasks(
      { documentationChecks: { testReports: false } },
      'APP-1'
    )

    expect(tasks[0].status.tag).toEqual({
      text: 'Failed',
      classes: 'govuk-tag--red'
    })
  })

  test('shows Not reviewed as plain text when the check has not been looked at', () => {
    const tasks = buildDocumentationTasks({}, 'APP-1')

    expect(tasks[0].status.text).toBe('Not reviewed')
    expect(tasks[0].status.tag).toBeUndefined()
  })

  test('shows Not reviewed as plain text when the check is null', () => {
    const tasks = buildDocumentationTasks(
      { documentationChecks: { testReports: null } },
      'APP-1'
    )

    expect(tasks[0].status.text).toBe('Not reviewed')
  })

  test('returns all four documentation tasks in order', () => {
    const tasks = buildDocumentationTasks({}, 'APP-1')

    expect(tasks.map((task) => task.title.text)).toEqual([
      'Review test reports',
      'Review technical drawings',
      'Review conformity mark',
      'Review instruction manual'
    ])
  })

  test('links each task to its own sub-page', () => {
    const tasks = buildDocumentationTasks({}, 'APP-1')

    expect(tasks[0].href).toBe('/review-appliance/APP-1/test-reports')
    expect(tasks[3].href).toBe('/review-appliance/APP-1/instruction-manual')
  })

  test('encodes the appliance id in task links', () => {
    const tasks = buildDocumentationTasks({}, 'APP/1')

    expect(tasks[0].href).toBe('/review-appliance/APP%2F1/test-reports')
  })

  test('handles a missing technicalReview without throwing', () => {
    expect(() => buildDocumentationTasks(undefined, 'APP-1')).not.toThrow()
  })
})

describe('#buildListingTasks', () => {
  test('returns all three listing tasks in order', () => {
    const tasks = buildListingTasks({}, 'APP-1')

    expect(tasks.map((task) => task.title.text)).toEqual([
      'Check appliance details',
      'Check permitted fuels',
      'Enter additional conditions'
    ])
  })

  test('shows a blue Completed tag when the check is done', () => {
    const tasks = buildListingTasks(
      { listingChecks: { applianceDetails: true } },
      'APP-1'
    )

    expect(tasks[0].status.tag).toEqual({
      text: 'Completed',
      classes: 'govuk-tag--blue'
    })
  })

  test('shows Not completed as plain text when the check is not done', () => {
    const tasks = buildListingTasks({}, 'APP-1')

    expect(tasks[0].status.text).toBe('Not completed')
    expect(tasks[0].status.tag).toBeUndefined()
  })

  test('treats false the same as not done', () => {
    const tasks = buildListingTasks(
      { listingChecks: { applianceDetails: false } },
      'APP-1'
    )

    expect(tasks[0].status.text).toBe('Not completed')
    expect(tasks[0].status.tag).toBeUndefined()
  })

  test('links to the listing sub-pages', () => {
    const tasks = buildListingTasks({}, 'APP-1')

    expect(tasks[0].href).toBe(
      '/review-appliance/APP-1/check-appliance-details'
    )
  })
})
