import { beforeEach, describe, expect, test, vi } from 'vitest'

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

    expect(fetchJsonMock).toHaveBeenCalledWith('/api/admin/appliances/APP%2F001')
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
