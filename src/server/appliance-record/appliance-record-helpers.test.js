import { describe, expect, test } from 'vitest'
import {
  buildActions,
  buildApplianceRecordData,
  buildDetailsRows,
  buildPublicListing,
  normalizeApplianceStatus,
  normalizeStatusKey
} from './appliance-record-helpers.js'

describe('appliance record helpers', () => {
  test('normalizes mixed-case backend status values for display logic', () => {
    expect(normalizeStatusKey(' Rejected ')).toBe('rejected')
    expect(normalizeStatusKey('Not Certified')).toBe('not_certified')
    expect(normalizeStatusKey('Awaiting Decision')).toBe('awaiting_decision')
  })

  test('maps normalized backend status values to the frontend appliance status', () => {
    expect(normalizeApplianceStatus('Rejected')).toBe('rejected')
    expect(normalizeApplianceStatus('Uncertified')).toBe('hidden')
    expect(normalizeApplianceStatus('Pending')).toBe('pending')
    expect(normalizeApplianceStatus('Live')).toBe('live')
  })

  test('builds the transformed appliance payload without changing the API contract', () => {
    const transformed = buildApplianceRecordData('APP-123', {
      id: 'APP-123',
      modelName: 'Test Model',
      applicationId: '0042',
      applianceStatus: 'rejected',
      updatedAt: '2026-01-10T10:00:00.000Z',
      technicalReview: { reviewedBy: 'Calvin May' },
      canTogglePublicVisibility: false,
      isLegacyRecord: false,
      certifications: {
        england: { status: 'rejected', lastCertifiedAt: null },
        scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
        wales: { status: 'uncertified', lastCertifiedAt: null },
        northernIreland: { status: 'not_certified', lastCertifiedAt: null }
      }
    })

    expect(transformed.applianceStatus).toBe('rejected')
    expect(transformed.statusDisplay.label).toBe('Rejected')
    expect(transformed.certifications[0].status).toBe('Rejected')
    expect(transformed.certifications[2].status).toBe('Uncertified')
    expect(transformed.certifications[3].status).toBe('Not certified')
    expect(transformed.details[3].label).toBe('Application 0042 details')
  })

  test('builds the public listing and action state for each appliance status', () => {
    const liveAppliance = {
      applianceStatus: 'live',
      publicListingUrl: '/appliance-list/APP-123',
      hideFromPublicUrl: '/change-display-status',
      buttons: { hideFromPublic: true }
    }

    expect(buildPublicListing(liveAppliance)).toEqual({
      showLink: true,
      url: '/appliance-list/APP-123',
      linkText: 'View public listing'
    })
    expect(buildActions(liveAppliance)).toEqual({
      buttons: [
        {
          text: 'Hide appliance from public list',
          href: '/change-display-status',
          classes: 'govuk-button govuk-button--secondary'
        }
      ]
    })
  })

  test('builds the correct detail rows for legacy and non-legacy records', () => {
    const nonLegacy = {
      applianceStatus: 'live',
      isLegacyRecord: false,
      details: [
        {
          label: 'Appliance details',
          viewUrl: '/appliance-record/APP-123/appliance-details'
        }
      ]
    }

    const legacy = {
      applianceStatus: 'live',
      isLegacyRecord: true,
      id: 'APP-123',
      applicationId: '0042',
      details: []
    }

    expect(buildDetailsRows(nonLegacy)).toEqual([
      {
        key: { text: 'Appliance details' },
        actions: {
          items: [
            {
              href: '/appliance-record/APP-123/appliance-details',
              text: 'View',
              visuallyHiddenText: 'appliance details'
            }
          ]
        }
      }
    ])

    expect(buildDetailsRows(legacy)[3].key.text).toBe(
      'Application 0042 details'
    )
  })
})
