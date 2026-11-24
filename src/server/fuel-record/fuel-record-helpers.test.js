import { describe, expect, test } from 'vitest'
import {
  buildActions,
  buildCertificationTableRows,
  buildDetailsRows,
  buildFuelRecordViewModel
} from './fuel-record-helpers.js'

const certifications = {
  england: { status: 'certified', firstCertifiedAt: '2025-05-10' },
  scotland: { status: 'uncertified', firstCertifiedAt: null },
  wales: { status: 'awaiting_decision', firstCertifiedAt: null },
  northernIreland: { status: 'certified', firstCertifiedAt: '2025-05-15' }
}

describe('#fuel-record-helpers', () => {
  test('builds certification rows with first certified date and accessible change links', () => {
    const rows = buildCertificationTableRows('F-1', certifications)

    expect(rows).toHaveLength(4)
    expect(rows[0][2]).toEqual({ text: '10 May 2025' })
    expect(rows[1][1].html).toContain('govuk-tag--grey')
    expect(rows[1][2]).toEqual({ text: 'Not certified' })
    expect(rows[2][1].html).toContain('Awaiting decision')
    expect(rows[3][3].html).toBe(
      '<a href="/fuel-record/F-1/approval-status-northern-ireland" class="govuk-link">Change<span class="govuk-visually-hidden"> certification status for Northern Ireland</span></a>'
    )
  })

  test('includes test results only for Manufacture fuels', () => {
    const manufacture = buildDetailsRows({
      id: 'F-1',
      supplierType: 'Manufacture',
      applicationId: '7756-0307'
    })
    const rebrand = buildDetailsRows({
      id: 'F-1',
      supplierType: 'Rebrand',
      applicationId: '7756-0304'
    })

    expect(manufacture.map((row) => row.key.text)).toEqual([
      'Fuel details',
      'Test results',
      'Application 0307 details - Manufacturer',
      'Action history'
    ])
    expect(rebrand.map((row) => row.key.text)).toEqual([
      'Fuel details',
      'Application 0304 details - Rebrander',
      'Action history'
    ])
    expect(manufacture[0].actions.items[0]).toEqual({
      href: '/fuel-record/F-1/fuel-details',
      text: 'View',
      visuallyHiddenText: 'fuel details'
    })
    expect(manufacture[2].actions.items[0].visuallyHiddenText).toBe(
      'application details'
    )
  })

  test.each([
    [{ canTogglePublicVisibility: false, isVisibleToPublic: true }, []],
    [
      { canTogglePublicVisibility: true, isVisibleToPublic: true },
      ['Hide fuel from public list']
    ],
    [
      { canTogglePublicVisibility: true, isVisibleToPublic: false },
      ['Make fuel live on public list']
    ]
  ])('buildActions(%o) shows %o', (flags, expected) => {
    const { buttons } = buildActions({ id: 'F-1', ...flags })

    expect(buttons.map((button) => button.text)).toEqual(expected)
  })

  test('builds breadcrumbs, title and fallback name', () => {
    const viewModel = buildFuelRecordViewModel('F-1', {
      name: '',
      status: 'pending',
      certifications
    })

    expect(viewModel.pageTitle).toBe('Fuel record for Unknown fuel')
    expect(viewModel.breadcrumbs.map((crumb) => crumb.text)).toEqual([
      'Home',
      'Fuel records',
      'Unknown fuel'
    ])
    expect(viewModel.statusDisplay.label).toBe('Pending government approval')
    expect(viewModel.publicListing.showLink).toBe(false)
  })
})
