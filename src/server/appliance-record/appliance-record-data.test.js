import { beforeEach, describe, expect, test, vi } from 'vitest'
import { applianceRecordContent } from './content.js'

const content = applianceRecordContent.en

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const { getApplianceRecord } = await import('./appliance-record-data.js')

describe('#getApplianceRecord', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('fetches appliance record from the admin endpoint', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        status: 'live',
        certifications: {
          england: { status: 'certified', lastCertifiedAt: null },
          scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
          wales: { status: 'uncertified', lastCertifiedAt: null },
          northernIreland: { status: 'not_certified', lastCertifiedAt: null }
        }
      }
    })

    await getApplianceRecord('APP-001')

    expect(fetchJsonMock).toHaveBeenCalledWith('/api/admin/appliances/APP-001')
  })

  test('encodes the appliance id in the request path', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP/001',
        modelName: 'Test Model',
        applianceStatus: 'live',
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    await getApplianceRecord('APP/001')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/api/admin/appliances/APP%2F001'
    )
  })

  test('supports both status and applianceStatus backend fields', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        status: 'live',
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')
    expect(result.data.applianceStatus).toBe('live')
    expect(result.data.statusDisplay.label).toBe('Live on public list')

    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'APP-002',
        modelName: 'Test Model',
        applianceStatus: 'hidden',
        canTogglePublicVisibility: true,
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const hiddenResult = await getApplianceRecord('APP-002')
    expect(hiddenResult.data.applianceStatus).toBe('hidden')
    expect(hiddenResult.data.buttons.makePublic).toBe(true)
  })

  test('preserves the backend legacy flag for legacy appliance records', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-LEGACY-001',
        modelName: 'Legacy Model',
        applicationId: '0042',
        isLegacyRecord: true,
        applianceStatus: 'live',
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const result = await getApplianceRecord('APP-LEGACY-001')

    expect(result.data.isLegacyRecord).toBe(true)
    expect(result.data.applicationId).toBe('0042')
    expect(result.data.details[3].label).toBe('Application 0042 details')
  })

  test('maps certification values and dates into the frontend format', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        applianceStatus: 'live',
        certifications: {
          england: { status: 'certified', lastCertifiedAt: '2026-10-01' },
          scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
          wales: { status: 'uncertified', lastCertifiedAt: '2026-10-15' },
          northernIreland: { status: 'not_certified', lastCertifiedAt: null }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')

    expect(result.data.certifications).toHaveLength(4)
    expect(result.data.certifications[0]).toMatchObject({
      country: 'England',
      status: 'Certified',
      dateCertified: '01/10/2026'
    })
    expect(result.data.certifications[1]).toMatchObject({
      country: 'Scotland',
      status: 'Awaiting decision',
      dateCertified: null
    })
    expect(result.data.certifications[2]).toMatchObject({
      country: 'Wales',
      status: 'Uncertified',
      dateCertified: '15/10/2026'
    })
  })

  test('includes the dynamic application ID in the detail label', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        applicationId: '0042',
        modelName: 'Test Model',
        status: 'live',
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')
    expect(result.data.details[3].label).toBe('Application 0042 details')
  })

  test('defaults the application label when no applicationId is present', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        applianceStatus: 'live',
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')
    expect(result.data.details[3].label).toBe('Application details')
  })

  test('uses centralized content defaults for rejected metadata and application detail labels', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        applicationId: '0042',
        modelName: 'Rejected Model',
        applianceStatus: 'rejected',
        technicalReview: null,
        certifications: {
          england: { status: 'rejected' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'awaiting_decision' },
          northernIreland: { status: 'awaiting_decision' }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')

    expect(result.data.details[3].label).toBe(
      content.formatApplicationDetailsLabel('0042')
    )
    expect(content.rejectedDetails.notSpecified).toBe('Not specified')
    expect(content.applianceStatus.rejected.label).toBe('Rejected')
  })

  test('shows the correct public listing and toggle actions by status', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Test Model',
        applianceStatus: 'live',
        canTogglePublicVisibility: true,
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const liveResult = await getApplianceRecord('APP-001')
    expect(liveResult.data.buttons.showPublicListing).toBe(true)
    expect(liveResult.data.buttons.hideFromPublic).toBe(true)

    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'APP-002',
        modelName: 'Hidden Model',
        applianceStatus: 'hidden',
        canTogglePublicVisibility: true,
        certifications: {
          england: { status: 'certified' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'uncertified' },
          northernIreland: { status: 'not_certified' }
        }
      }
    })

    const hiddenResult = await getApplianceRecord('APP-002')
    expect(hiddenResult.data.buttons.makePublic).toBe(true)
  })

  test('returns status display for rejected appliance', async () => {
    fetchJsonMock.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-001',
        modelName: 'Rejected Model',
        applianceStatus: 'rejected',
        updatedAt: '2026-01-10T10:00:00.000Z',
        technicalReview: { reviewedBy: 'Calvin May' },
        canTogglePublicVisibility: false,
        certifications: {
          england: { status: 'rejected' },
          scotland: { status: 'awaiting_decision' },
          wales: { status: 'awaiting_decision' },
          northernIreland: { status: 'awaiting_decision' }
        }
      }
    })

    const result = await getApplianceRecord('APP-001')

    expect(result.data.statusDisplay.label).toBe('Rejected')
    expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--red')
    expect(result.data.updatedAt).toBe('2026-01-10T10:00:00.000Z')
    expect(result.data.technicalReview.reviewedBy).toBe('Calvin May')
    expect(result.data.buttons.showPublicListing).toBeUndefined()
    expect(result.data.buttons.hideFromPublic).toBeUndefined()
    expect(result.data.buttons.makePublic).toBeUndefined()
  })

  test('returns an error object when the backend request fails', async () => {
    fetchJsonMock.mockResolvedValue({
      success: false,
      message: 'Backend unavailable'
    })

    const result = await getApplianceRecord('APP-001')

    expect(result).toEqual({
      success: false,
      message: 'Backend unavailable'
    })
  })
})
