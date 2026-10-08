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

  describe('successful response', () => {
    // NOTE: Tests in this section intentionally use applianceStatus: 'live' for most tests
    // because they verify status-INDEPENDENT features (country mapping, date formatting, URL encoding).
    // Status-SPECIFIC button and label tests are in the 'status display and visibility toggle' section below.

    test('fetches appliance record from /admin-appliances/{id}', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'certified', lastCertifiedAt: null },
            scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
            wales: { status: 'uncertified', lastCertifiedAt: null },
            northernIreland: { status: 'not_certified', lastCertifiedAt: null }
          }
        }
      })

      await getApplianceRecord('APP-001')

      expect(fetchJsonMock).toHaveBeenCalledWith('/admin-appliances/APP-001')
    })

    test('encodes appliance id in the path', async () => {
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

      expect(fetchJsonMock).toHaveBeenCalledWith('/admin-appliances/APP%2F001')
    })

    test('returns appliance record with all certifications', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Appliance',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'certified', lastCertifiedAt: null },
            scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
            wales: { status: 'uncertified', lastCertifiedAt: null },
            northernIreland: { status: 'not_certified', lastCertifiedAt: null }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.success).toBe(true)
      expect(result.data.id).toBe('APP-001')
      expect(result.data.modelName).toBe('Test Appliance')
      expect(result.data.applianceStatus).toBe('live')
      expect(result.data.statusDisplay.label).toBe('Live on public list')
      expect(result.data.certifications).toHaveLength(4)
    })

    test('maps country keys to display names', async () => {
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

      expect(result.data.certifications[0].country).toBe('England')
      expect(result.data.certifications[1].country).toBe('Scotland')
      expect(result.data.certifications[2].country).toBe('Wales')
      expect(result.data.certifications[3].country).toBe('Northern Ireland')
    })

    test('maps status values to display labels', async () => {
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

      expect(result.data.certifications[0].status).toBe('Certified')
      expect(result.data.certifications[1].status).toBe('Awaiting decision')
      expect(result.data.certifications[2].status).toBe('Uncertified')
      expect(result.data.certifications[3].status).toBe('Not certified')
    })

    test('formats certification dates to DD/MM/YYYY', async () => {
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

      expect(result.data.certifications[0].dateCertified).toBe('01/10/2026')
      expect(result.data.certifications[1].dateCertified).toBeNull()
      expect(result.data.certifications[2].dateCertified).toBe('15/10/2026')
      expect(result.data.certifications[3].dateCertified).toBeNull()
    })

    test('sets dateCertified to null when lastCertifiedAt is missing', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'awaiting_decision' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      result.data.certifications.forEach((cert) => {
        expect(cert.dateCertified).toBeNull()
      })
    })

    test('builds correct change URLs for each country', async () => {
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

      expect(result.data.certifications[0].changeUrl).toBe(
        '/appliance-record/APP-001/certification/england'
      )
      expect(result.data.certifications[1].changeUrl).toBe(
        '/appliance-record/APP-001/certification/scotland'
      )
      expect(result.data.certifications[2].changeUrl).toBe(
        '/appliance-record/APP-001/certification/wales'
      )
      expect(result.data.certifications[3].changeUrl).toBe(
        '/appliance-record/APP-001/certification/northernIreland'
      )
    })

    test('encodes appliance id in change URLs', async () => {
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

      const result = await getApplianceRecord('APP/001')

      expect(result.data.certifications[0].changeUrl).toBe(
        '/appliance-record/APP%2F001/certification/england'
      )
    })

    test('includes details array with all sections', async () => {
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

      expect(result.data.details).toHaveLength(5)
      expect(result.data.details.map((d) => d.label)).toEqual([
        'Appliance details',
        'Test results',
        'Instruction manual',
        'Application details',
        'Action history'
      ])
    })

    test('builds correct detail view URLs', async () => {
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

      expect(result.data.details[0].viewUrl).toBe(
        '/appliance-record/APP-001/appliance-details'
      )
      expect(result.data.details[1].viewUrl).toBe(
        '/appliance-record/APP-001/test-reports'
      )
      expect(result.data.details[2].viewUrl).toBe(
        '/appliance-record/APP-001/instruction-manual'
      )
      expect(result.data.details[3].viewUrl).toBe(
        '/appliance-record/APP-001/application-details'
      )
      expect(result.data.details[4].viewUrl).toBe(
        '/appliance-record/APP-001/action-history'
      )
    })

    test('includes application ID in details label when applicationId provided', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          applicationId: '0042',
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
      const applicationDetailsItem = result.data.details[3]

      expect(applicationDetailsItem.label).toBe('Application 0042 details')
    })

    test('uses default application details label when no applicationId', async () => {
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
      const applicationDetailsItem = result.data.details[3]

      expect(applicationDetailsItem.label).toBe('Application details')
    })

    test('uses default model name when empty', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: '',
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

      expect(result.data.modelName).toBe('Unknown model')
    })

    test('uses default status when empty', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: '',
          canTogglePublicVisibility: false,
          certifications: {
            england: { status: 'certified' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'uncertified' },
            northernIreland: { status: 'not_certified' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.statusDisplay.label).toBe(
        'Pending government approval'
      )
      expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--yellow')
    })

    test('handles missing certification data gracefully', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'certified' },
            scotland: { status: 'awaiting_decision' }
            // wales and northernIreland missing
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.certifications).toHaveLength(4)
      expect(result.data.certifications[2].status).toBe(undefined)
      expect(result.data.certifications[3].status).toBe(undefined)
    })

    test('handles unknown status labels gracefully', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'unknown_status' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'uncertified' },
            northernIreland: { status: 'not_certified' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.certifications[0].status).toBe('unknown_status')
    })
  })

  describe('error responses', () => {
    test('returns error when API response is not successful', async () => {
      fetchJsonMock.mockResolvedValue({
        success: false,
        message: 'Appliance not found'
      })

      const result = await getApplianceRecord('APP-999')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Appliance not found')
    })

    test('uses default error message when message is missing', async () => {
      fetchJsonMock.mockResolvedValue({
        success: false
      })

      const result = await getApplianceRecord('APP-999')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to load appliance record')
    })

    test('throws error when API call fails', async () => {
      const error = new Error('Network error')
      fetchJsonMock.mockRejectedValue(error)

      await expect(getApplianceRecord('APP-001')).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('data transformation edge cases', () => {
    test('handles date with single digit day and month', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'certified', lastCertifiedAt: '2026-01-05' },
            scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
            wales: { status: 'uncertified', lastCertifiedAt: null },
            northernIreland: { status: 'not_certified', lastCertifiedAt: null }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.certifications[0].dateCertified).toBe('05/01/2026')
    })

    test('handles year 2000 dates', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            england: { status: 'certified', lastCertifiedAt: '2000-01-01' },
            scotland: { status: 'awaiting_decision', lastCertifiedAt: null },
            wales: { status: 'uncertified', lastCertifiedAt: null },
            northernIreland: { status: 'not_certified', lastCertifiedAt: null }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.certifications[0].dateCertified).toBe('01/01/2000')
    })

    test('preserves appliance ID in returned data', async () => {
      const applianceId = 'APP-TEST-12345'
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: applianceId,
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

      const result = await getApplianceRecord(applianceId)

      expect(result.data.id).toBe(applianceId)
    })

    test('certifications are in consistent order', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          certifications: {
            northernIreland: { status: 'not_certified' },
            wales: { status: 'uncertified' },
            scotland: { status: 'awaiting_decision' },
            england: { status: 'certified' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.certifications[0].country).toBe('England')
      expect(result.data.certifications[1].country).toBe('Scotland')
      expect(result.data.certifications[2].country).toBe('Wales')
      expect(result.data.certifications[3].country).toBe('Northern Ireland')
    })
  })

  describe('status display and visibility toggle', () => {
    // ========== COMPREHENSIVE STATUS TESTING ==========
    // This section contains dedicated tests for EACH appliance status:
    // 1. Pending status (yellow tag, no buttons)
    // 2. Live status (green tag, view + hide buttons)
    // 3. Hidden status WITH toggle capability (grey tag, make-public button)
    // 4. Hidden status WITHOUT toggle capability (grey tag, no buttons)
    // Each status is tested for: label, tag color, button flags, URLs
    // ================================================

    test('returns status display for pending appliance', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'pending',
          canTogglePublicVisibility: false,
          certifications: {
            england: { status: 'awaiting_decision' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.statusDisplay.label).toBe(
        'Pending government approval'
      )
      expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--yellow')
      expect(result.data.buttons.showPublicListing).toBeUndefined()
      expect(result.data.buttons.hideFromPublic).toBeUndefined()
      expect(result.data.buttons.makePublic).toBeUndefined()
    })

    test('returns status display for live appliance', async () => {
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
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.statusDisplay.label).toBe('Live on public list')
      expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--green')
      expect(result.data.buttons.showPublicListing).toBe(true)
      expect(result.data.buttons.hideFromPublic).toBe(true)
      expect(result.data.buttons.makePublic).toBeUndefined()
    })

    test('returns status display for hidden appliance with toggle permission', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'hidden',
          canTogglePublicVisibility: true,
          certifications: {
            england: { status: 'certified' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.statusDisplay.label).toBe('Hidden from public list')
      expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--grey')
      expect(result.data.buttons.showPublicListing).toBeUndefined()
      expect(result.data.buttons.hideFromPublic).toBeUndefined()
      expect(result.data.buttons.makePublic).toBe(true)
    })

    test('returns status display for hidden appliance without toggle permission', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'hidden',
          canTogglePublicVisibility: false,
          certifications: {
            england: { status: 'awaiting_decision' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'uncertified' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.statusDisplay.label).toBe('Hidden from public list')
      expect(result.data.statusDisplay.tagClass).toBe('govuk-tag--grey')
      expect(result.data.buttons.showPublicListing).toBeUndefined()
      expect(result.data.buttons.hideFromPublic).toBeUndefined()
      expect(result.data.buttons.makePublic).toBeUndefined()
    })

    test('builds correct public listing URL', async () => {
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
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.publicListingUrl).toBe('/appliance-list/APP-001')
    })

    test('encodes appliance id in public listing URL', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP/001',
          modelName: 'Test Model',
          applianceStatus: 'live',
          canTogglePublicVisibility: true,
          certifications: {
            england: { status: 'certified' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP/001')

      expect(result.data.publicListingUrl).toBe('/appliance-list/APP%2F001')
    })

    test('builds correct hide and make public URLs', async () => {
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
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.hideFromPublicUrl).toBe(
        '/appliance-record/APP-001/hide-from-public'
      )
      expect(result.data.makePublicUrl).toBe(
        '/appliance-record/APP-001/make-public'
      )
    })

    test('passes canTogglePublicVisibility flag', async () => {
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
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.canTogglePublicVisibility).toBe(true)
    })

    test('defaults canTogglePublicVisibility to false when missing', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          id: 'APP-001',
          modelName: 'Test Model',
          applianceStatus: 'pending',
          certifications: {
            england: { status: 'awaiting_decision' },
            scotland: { status: 'awaiting_decision' },
            wales: { status: 'awaiting_decision' },
            northernIreland: { status: 'awaiting_decision' }
          }
        }
      })

      const result = await getApplianceRecord('APP-001')

      expect(result.data.canTogglePublicVisibility).toBe(false)
    })
  })
})
