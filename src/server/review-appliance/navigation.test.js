import { applianceReviewContent } from './content.js'
import {
  applicationPath,
  appliancePath,
  incompleteReviewPath,
  buildApplianceBreadcrumbs
} from './navigation.js'

const content = applianceReviewContent.en

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M20i',
  applicationId: '1084'
}

describe('#path builders', () => {
  test('builds the application, appliance and incomplete review paths', () => {
    expect(applicationPath('1084')).toBe('/review-appliance-application/1084')
    expect(appliancePath('APP-1')).toBe('/review-appliance/APP-1')
    expect(incompleteReviewPath('APP-1')).toBe(
      '/review-appliance/APP-1/incomplete-review'
    )
  })

  test('escapes ids that contain path characters', () => {
    expect(appliancePath('APP/1')).toBe('/review-appliance/APP%2F1')
    expect(incompleteReviewPath('APP/1')).toBe(
      '/review-appliance/APP%2F1/incomplete-review'
    )
    expect(applicationPath('10/84')).toBe(
      '/review-appliance-application/10%2F84'
    )
  })
})

describe('#buildApplianceBreadcrumbs', () => {
  test('final crumb has no href by default', () => {
    expect(buildApplianceBreadcrumbs(baseAppliance)).toEqual([
      { text: 'Home', href: '/manage-certifications' },
      { text: 'Appliance applications', href: '/appliance-applications' },
      {
        text: 'Review appliance application 1084',
        href: '/review-appliance-application/1084'
      },
      { text: 'Review Twin Heat M20i' }
    ])
  })

  test('final crumb links to the appliance review when asked', () => {
    const crumbs = buildApplianceBreadcrumbs(baseAppliance, {
      linkAppliance: true
    })

    expect(crumbs.at(-1)).toEqual({
      text: 'Review Twin Heat M20i',
      href: '/review-appliance/APP-1'
    })
  })

  test('final crumb label matches the review page heading', () => {
    const crumbs = buildApplianceBreadcrumbs(baseAppliance)

    expect(crumbs.at(-1).text).toBe(content.heading(baseAppliance.modelName))
  })
})
