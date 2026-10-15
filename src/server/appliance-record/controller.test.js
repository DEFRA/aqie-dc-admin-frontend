import { beforeEach, describe, expect, test, vi } from 'vitest'
import { handleGetApplianceRecordPage } from './controller.js'
import { applianceRecordContent } from './content.js'

const content = applianceRecordContent.en

const { fetchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock
}))

const mockBackendResponse = {
  success: true,
  data: {
    id: 'APP-123',
    modelName: 'Test Appliance Model',
    status: 'live',
    canTogglePublicVisibility: true,
    certifications: {
      england: {
        status: 'certified',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-01'
      },
      scotland: {
        status: 'awaiting_decision',
        firstCertifiedAt: null,
        lastCertifiedAt: null
      },
      wales: {
        status: 'uncertified',
        firstCertifiedAt: null,
        lastCertifiedAt: null
      },
      northernIreland: {
        status: 'awaiting_decision',
        firstCertifiedAt: null,
        lastCertifiedAt: '2026-10-04'
      }
    }
  }
}

const mockApplianceRecord = {
  success: true,
  data: {
    id: 'APP-123',
    modelName: 'Test Appliance Model',
    status: 'live',
    updatedAt: null,
    technicalReview: null,
    statusDisplay: {
      label: 'Live on public list',
      tagClass: 'govuk-tag--green'
    },
    canTogglePublicVisibility: true,
    buttons: {
      showPublicListing: true,
      hideFromPublic: true
    },
    publicListingUrl: '/appliance-list/APP-123',
    hideFromPublicUrl: '/change-display-status',
    makePublicUrl: '/change-display-status',
    certifications: [
      {
        country: 'England',
        status: 'certified',
        dateCertified: '01/10/2026',
        changeUrl: '/approval-status-england'
      },
      {
        country: 'Scotland',
        status: 'awaiting_decision',
        dateCertified: null,
        changeUrl: '/approval-status-scotland'
      },
      {
        country: 'Wales',
        status: 'uncertified',
        dateCertified: null,
        changeUrl: '/approval-status-wales'
      },
      {
        country: 'Northern Ireland',
        status: 'awaiting_decision',
        dateCertified: '04/10/2026',
        changeUrl: '/approval-status-northernIreland'
      }
    ],
    details: [
      {
        label: 'Appliance details',
        viewUrl: '/appliance-record/APP-123/appliance-details'
      },
      {
        label: 'Test results',
        viewUrl: '/appliance-record/APP-123/test-reports'
      },
      {
        label: 'Instruction manual',
        viewUrl: '/appliance-record/APP-123/instruction-manual'
      },
      {
        label: 'Application details',
        viewUrl: '/appliance-record/APP-123/application-details'
      },
      {
        label: 'Action history',
        viewUrl: '/appliance-record/APP-123/action-history'
      }
    ]
  }
}

function toolkit() {
  return {
    view: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis()
  }
}

describe('applianceRecord controller', () => {
  describe('GET handler', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test('successfully renders appliance record page with data', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      expect(h.view).toHaveBeenCalledWith(
        'appliance-record/index',
        expect.any(Object)
      )
    })

    test('passes correct page title and heading to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.pageTitle).toBe(
        'Appliance record for Test Appliance Model'
      )
      expect(callArgs.pageHeading).toBe('Test Appliance Model')
    })

    test('passes appliance data to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.appliance).toEqual(mockApplianceRecord.data)
    })

    test('passes table headers for certifications to template', async () => {
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
      expect(callArgs.certificationTableRows).toHaveLength(4)
      expect(callArgs.certificationTableRows[0][0].text).toBe('England')
      expect(callArgs.certificationTableRows[0][1].html).toContain('govuk-tag')
      expect(callArgs.certificationTableRows[0][1].html).toContain('Certified')
      expect(callArgs.certificationTableRows[0][2].text).toBe('01/10/2026')
    })

    test('passes appliance certifications with change links', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.certificationTableRows[0][3].html).toContain(
        '/approval-status-england'
      )
      expect(callArgs.certificationTableRows[0][3].html).toContain('Change')
      expect(callArgs.certificationTableRows[0][3].html).toContain(
        'certification for England'
      )
      expect(callArgs.certificationTableRows[1][3].html).toContain(
        '/approval-status-scotland'
      )
    })

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

    test('passes all required content labels to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.certificationStatusTitle).toBe('Certification status')
      expect(callArgs.detailsTitle).toBe('Details')
      expect(callArgs.returnLinkText).toBe('Return to appliance records')
    })

    test('passes details rows with view links', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.detailsRows).toHaveLength(5)
      expect(callArgs.detailsRows[0].key.text).toBe('Appliance details')
      expect(callArgs.detailsRows[0].actions.items[0].href).toBe(
        '/appliance-record/APP-123/appliance-details'
      )
      expect(callArgs.detailsRows[0].actions.items[0].text).toBe('View')
      expect(callArgs.detailsRows[0].actions.items[0].visuallyHiddenText).toBe(
        'appliance details'
      )
    })

    test('passes return link URL to template', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.returnLinkUrl).toBe('/appliance-records')
    })

    test('passes status display with correct color for live status', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.statusDisplay).toEqual({
        label: 'Live on public list',
        tagClass: 'govuk-tag--green'
      })
    })

    test('passes public listing link and hide button for live appliance', async () => {
      fetchJsonMock.mockResolvedValue(mockBackendResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.publicListing.showLink).toBe(true)
      expect(callArgs.publicListing.url).toBe('/appliance-list/APP-123')
      expect(callArgs.publicListing.linkText).toBe('View public listing')
      expect(callArgs.actions.buttons).toHaveLength(1)
      expect(callArgs.actions.buttons[0].text).toBe(
        'Hide appliance from public list'
      )
      expect(callArgs.actions.buttons[0].href).toBe('/change-display-status')
    })

    test('passes rejected details rows with rejection metadata and back link text', async () => {
      const rejectedResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          status: 'rejected',
          canTogglePublicVisibility: false,
          updatedAt: '2026-01-10T10:00:00.000Z',
          technicalReview: { reviewedBy: 'Calvin May' }
        }
      }

      fetchJsonMock.mockResolvedValue(rejectedResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.applianceStatus).toBe(content.statusValues.rejected)
      expect(callArgs.rejectedStatus).toBe(content.statusValues.rejected)
      expect(callArgs.backLinkText).toBe(content.backLinkText)
      expect(callArgs.detailsRows).toHaveLength(7)
      expect(callArgs.detailsRows[0].key.text).toBe('Date rejected')
      expect(callArgs.detailsRows[0].value.text).toBe('10/01/2026')
      expect(callArgs.detailsRows[1].key.text).toBe('Rejected by')
      expect(callArgs.detailsRows[1].value.text).toBe('Calvin May')
      expect(callArgs.detailsRows[2].key.text).toBe('Appliance details')
    })

    test('passes no public listing link or buttons for pending appliance', async () => {
      const pendingResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          status: 'pending',
          canTogglePublicVisibility: false
        }
      }
      fetchJsonMock.mockResolvedValue(pendingResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.publicListing.showLink).toBe(false)
      expect(callArgs.actions.buttons).toHaveLength(0)
      expect(callArgs.statusDisplay.label).toBe('Pending government approval')
      expect(callArgs.statusDisplay.tagClass).toBe('govuk-tag--yellow')
    })

    test('passes make public button for hidden appliance with toggle permission', async () => {
      const hiddenResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          status: 'hidden',
          canTogglePublicVisibility: true
        }
      }
      fetchJsonMock.mockResolvedValue(hiddenResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.publicListing.showLink).toBe(false)
      expect(callArgs.actions.buttons).toHaveLength(1)
      expect(callArgs.actions.buttons[0].text).toBe(
        'Make appliance live on public list'
      )
      expect(callArgs.actions.buttons[0].href).toBe('/change-display-status')
      expect(callArgs.statusDisplay.label).toBe('Hidden from public list')
      expect(callArgs.statusDisplay.tagClass).toBe('govuk-tag--grey')
    })

    test('passes no public listing link or buttons for hidden appliance without toggle permission', async () => {
      const hiddenResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          status: 'hidden',
          canTogglePublicVisibility: false
        }
      }
      fetchJsonMock.mockResolvedValue(hiddenResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.publicListing.showLink).toBe(false)
      expect(callArgs.actions.buttons).toHaveLength(0)
      expect(callArgs.statusDisplay.label).toBe('Hidden from public list')
    })

    test('passes rejected details rows with rejection metadata and back link text', async () => {
      const rejectedResponse = {
        ...mockBackendResponse,
        data: {
          ...mockBackendResponse.data,
          status: 'rejected',
          canTogglePublicVisibility: false,
          updatedAt: '2026-01-10T10:00:00.000Z',
          technicalReview: { reviewedBy: 'Calvin May' }
        }
      }

      fetchJsonMock.mockResolvedValue(rejectedResponse)
      const h = toolkit()

      await handleGetApplianceRecordPage(
        { params: { applianceId: 'APP-123' } },
        h
      )

      const callArgs = h.view.mock.calls[0][1]
      expect(callArgs.applianceStatus).toBe('rejected')
      expect(callArgs.rejectedStatus).toBe('rejected')
      expect(callArgs.backLinkText).toBe('Back')
      expect(callArgs.detailsRows).toHaveLength(7)
      expect(callArgs.detailsRows[0].key.text).toBe('Date rejected')
      expect(callArgs.detailsRows[0].value.text).toBe('10/01/2026')
      expect(callArgs.detailsRows[1].key.text).toBe('Rejected by')
      expect(callArgs.detailsRows[1].value.text).toBe('Calvin May')
    })
  })
})
