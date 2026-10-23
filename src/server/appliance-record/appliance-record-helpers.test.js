import { describe, expect, test } from 'vitest'
import {
  buildActions,
  buildApplianceRecordData,
  buildDetailsRows,
  buildPublicListing,
  normalizeApplianceStatus
} from './appliance-record-helpers.js'

describe('appliance record helpers', () => {
  test('keeps valid backend appliance statuses and defaults the rest to pending', () => {
    expect(normalizeApplianceStatus('rejected')).toBe('rejected')
    expect(normalizeApplianceStatus('hidden')).toBe('hidden')
    expect(normalizeApplianceStatus('pending')).toBe('pending')
    expect(normalizeApplianceStatus('live')).toBe('live')
    expect(normalizeApplianceStatus(undefined)).toBe('pending')
  })

  test('builds the transformed appliance payload without changing the API contract', () => {
    const transformed = buildApplianceRecordData('APP-123', {
      id: 'APP-123',
      modelName: 'Test Model',
      applicationId: '0042',
      status: 'rejected',
      updatedAt: '2026-01-10T10:00:00.000Z',
      technicalReview: { reviewedBy: 'Calvin May' },
      canTogglePublicVisibility: false,
      isLegacyRecord: false,
      certifications: {
        england: { status: 'certified', lastCertifiedAt: null },
        scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
        wales: { status: 'uncertified', lastCertifiedAt: null },
        northernIreland: { status: 'uncertified', lastCertifiedAt: null }
      }
    })

    expect(transformed.applianceStatus).toBe('rejected')
    expect(transformed.statusDisplay.label).toBe('Rejected')
    expect(transformed.certifications[0].status).toBe('certified')
    expect(transformed.certifications[1].status).toBe('awaiting_decision')
    expect(transformed.certifications[2].status).toBe('uncertified')
    expect(transformed.details[3].label).toBe('Application 0042 details')
  })

  test('builds the public listing and action state for each appliance status', () => {
    const liveAppliance = {
      applianceStatus: 'live',
      publicListingUrl: '/appliance-list/APP-123',
      hideFromPublicUrl: '/appliance-record/APP-123/change-display-status',
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
          href: '/appliance-record/APP-123/change-display-status',
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
      legacy: { applicationId: '0042' },
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

    // No instructionManual or legacy.comments on this fixture, so both
    // conditional rows are hidden — application details is at index 1.
    expect(buildDetailsRows(legacy)[1].key.text).toBe(
      'Application 0042 details'
    )
  })
})
