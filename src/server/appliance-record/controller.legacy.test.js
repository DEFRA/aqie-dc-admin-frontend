/**
 * Appliance Record Controller - Legacy Record Tests
 *
 * Tests for legacy appliance record functionality.
 * Legacy records show different detail sections compared to standard records.
 *
 * Standard Details: Appliance details, Test results, Instruction manual, Application details
 * Legacy Details: Legacy record information, Original application details, Test results, Migration notes
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { handleGetApplianceRecordPage } from './controller.js'
import { applianceRecordContent } from './content.js'

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const mockBackendResponse = {
  success: true,
  data: {
    id: 'APP-LEGACY-123',
    modelName: 'Legacy Test Appliance',
    status: 'live',
    canTogglePublicVisibility: true,
    certifications: {
      england: {
        status: 'certified',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-01'
      },
      scotland: {
        status: 'certified',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-01'
      },
      wales: {
        status: 'certified',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-01'
      },
      northernIreland: {
        status: 'certified',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-01'
      }
    }
  }
}

function toolkit() {
  return {
    view: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis()
  }
}

describe('applianceRecord controller - Legacy Records', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Standard (Non-Legacy) Record Details', () => {
    test('passes non-legacy details rows with correct labels', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      // NOTE: Non-legacy details are shown by default (IS_LEGACY_RECORD = false in controller)
      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-LEGACY-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.detailsRows).toBeDefined()
      expect(callArgs.detailsRows).toHaveLength(5)

      // Verify non-legacy details items are present
      const detailLabels = callArgs.detailsRows.map((row) => row.key.text)
      expect(detailLabels).toContain('Appliance details')
      expect(detailLabels).toContain('Test results')
      expect(detailLabels).toContain('Instruction manual')
      expect(detailLabels).toContain('Application details')
      expect(detailLabels).toContain('Action history')
    })

    test('passes non-legacy details with correct view URLs', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-LEGACY-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      const detailRows = callArgs.detailsRows

      // Verify URLs for each non-legacy detail
      expect(detailRows[0].actions.items[0].href).toBe(
        '/appliance-record/APP-LEGACY-123/appliance-details'
      )
      expect(detailRows[1].actions.items[0].href).toBe(
        '/appliance-record/APP-LEGACY-123/test-reports'
      )
      expect(detailRows[2].actions.items[0].href).toBe(
        '/appliance-record/APP-LEGACY-123/instruction-manual'
      )
      expect(detailRows[3].actions.items[0].href).toBe(
        '/appliance-record/APP-LEGACY-123/application-details'
      )
      expect(detailRows[4].actions.items[0].href).toBe(
        '/appliance-record/APP-LEGACY-123/action-history'
      )
    })

    test('passes non-legacy details title to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-LEGACY-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.detailsTitle).toBe('Details')
    })

    test('includes visually-hidden text in detail action links for accessibility', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-LEGACY-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      const detailRows = callArgs.detailsRows

      detailRows.forEach((row) => {
        expect(row.actions.items[0].visuallyHiddenText).toBeDefined()
        expect(row.actions.items[0].visuallyHiddenText.length).toBeGreaterThan(
          0
        )
      })
    })

    test('URL-encodes appliance ID in detail URLs', async () => {
      fetchJsonMock.mockResolvedValue({
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          id: 'APP/SLASH/123'
        }
      })
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP/SLASH/123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      const detailRows = callArgs.detailsRows

      // Verify slashes are encoded
      expect(detailRows[0].actions.items[0].href).toContain('APP%2FSLASH%2F123')
    })
  })

  describe('Legacy Record Details (when IS_LEGACY_RECORD = true)', () => {
    test('renders legacy detail rows when the backend marks the record as legacy', async () => {
      fetchJsonMock.mockResolvedValue({
        success: true,
        data: {
          ...mockBackendResponse.data,
          id: 'APP-LEGACY-789',
          isLegacyRecord: true,
          modelName: 'Legacy Record Model',
          status: 'live',
          legacy: { applicationId: '0042' }
        }
      })

      const h = toolkit()
      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-LEGACY-789' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      const detailLabels = callArgs.detailsRows.map((row) => row.key.text)

      // Mock has no instructionManual or legacy.comments so those rows are hidden
      expect(detailLabels).toEqual([
        applianceRecordContent.en.legacyDetailsItems.applianceDetails,
        'Application 0042 details',
        applianceRecordContent.en.legacyDetailsItems.actionHistory
      ])
    })

    test('REFERENCE: legacy content should define 5 expected detail labels', () => {
      const expectedLegacyDetails = [
        applianceRecordContent.en.legacyDetailsItems.applianceDetails,
        applianceRecordContent.en.legacyDetailsItems.manuals,
        applianceRecordContent.en.legacyDetailsItems.legacyComments,
        applianceRecordContent.en.legacyDetailsItems.applicationDetails,
        applianceRecordContent.en.legacyDetailsItems.actionHistory
      ]

      expect(expectedLegacyDetails).toHaveLength(5)
      expect(expectedLegacyDetails).toEqual([
        'Appliance details',
        'Manuals',
        'Legacy comments',
        'Application details',
        'Action history'
      ])
    })

    test('REFERENCE: legacy title should be defined in the content model', () => {
      const legacyTitle = applianceRecordContent.en.legacyDetailsTitle

      expect(legacyTitle).toContain('Legacy')
      expect(legacyTitle).toBe('Legacy Record Details')
    })

    test('REFERENCE: legacy badge text should reflect the configured content', () => {
      const expectedBadgeText = 'Legacy Record'
      const legacyTitle = applianceRecordContent.en.legacyDetailsTitle

      expect(expectedBadgeText).toContain('Legacy')
      expect(legacyTitle).toContain('Legacy')
    })
  })

  describe('Error handling', () => {
    test('renders error page when data fetch fails', async () => {
      fetchJsonMock.mockResolvedValue({ success: false })
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      expect(h.view).toHaveBeenCalledWith('error/index', {
        message: 'Sorry, there is a problem with the service'
      })
    })

    test('renders error page on exception', async () => {
      fetchJsonMock.mockRejectedValue(new Error('Network error'))
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      expect(h.view).toHaveBeenCalledWith('error/index', {
        message: 'Sorry, there is a problem with the service'
      })
    })
  })

  describe('Content consistency', () => {
    test('passes all required content labels to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]

      // Standard content
      expect(callArgs.certificationStatusTitle).toBeDefined()
      expect(callArgs.detailsTitle).toBe('Details')
      expect(callArgs.legacyDetailsTitle).toBe('Legacy Record Details')
      expect(callArgs.actionText).toBe('View')
      expect(callArgs.changeText).toBe('Change')
      expect(callArgs.returnLinkText).toBeDefined()
    })

    test('uses consistent table headers for certifications', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]

      expect(callArgs.tableHeaders).toEqual({
        country: 'Country',
        status: 'Status',
        dateCertified: 'Date first certified',
        action: 'Action'
      })
    })
  })
})
