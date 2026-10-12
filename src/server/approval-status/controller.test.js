import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  approvalsStatusController,
  approvalsStatusDecisionController
} from './controller.js'
import * as approvalStatusData from './approval-status-data.js'

// Mock the data module
vi.mock('./approval-status-data.js', () => ({
  getApplianceForApprovalStatus: vi.fn(),
  updateCertificationStatus: vi.fn()
}))

const systemDecidedBy = { name: 'System', email: 'system@example.com' }

describe('Approval Status Controller', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockH = {
      view: vi.fn((template, data) => ({
        code: vi.fn((statusCode) => ({ statusCode, template, data }))
      })),
      redirect: vi.fn((path) => ({ redirect: path }))
    }

    mockRequest = {
      params: {
        applianceId: 'APP-001',
        country: 'england'
      },
      payload: {
        decision: 'yes'
      }
    }
  })

  describe('approvalsStatusController (GET)', () => {
    it('should render approval status form for certified appliance', async () => {
      const mockAppliance = {
        id: 'APP-001',
        modelName: 'Test Stove',
        englandCertification: {
          status: 'certified',
          decidedAt: new Date('2026-01-01'),
          decidedBy: { name: 'John', email: 'john@example.com' }
        }
      }

      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: mockAppliance
      })

      await approvalsStatusController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalled()
      const [template, viewData] = mockH.view.mock.calls[0]
      expect(template).toBe('approval-status/index')
      expect(viewData.appliance).toEqual(mockAppliance)
      expect(viewData.currentStatus).toBe('certified')
      expect(viewData.question).toContain('uncertified')
    })

    it('should render approval status form for uncertified appliance', async () => {
      const mockAppliance = {
        id: 'APP-001',
        modelName: 'Test Stove',
        englandCertification: {
          status: 'uncertified',
          decidedAt: new Date('2026-02-01'),
          decidedBy: { name: 'Jane', email: 'jane@example.com' }
        }
      }

      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: mockAppliance
      })

      await approvalsStatusController.handler(mockRequest, mockH)

      const [, viewData] = mockH.view.mock.calls[0]
      expect(viewData.currentStatus).toBe('uncertified')
      expect(viewData.question).toContain('certified')
    })

    it('should render approval status form for awaiting_decision appliance', async () => {
      const mockAppliance = {
        id: 'APP-001',
        modelName: 'Test Stove',
        englandCertification: {
          status: 'awaiting_decision'
        }
      }

      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: mockAppliance
      })

      await approvalsStatusController.handler(mockRequest, mockH)

      const [, viewData] = mockH.view.mock.calls[0]
      expect(viewData.currentStatus).toBe('awaiting_decision')
      expect(viewData.radioOptions.length).toBe(2)
      expect(viewData.radioOptions[0].value).toBe('certified')
      expect(viewData.radioOptions[1].value).toBe('uncertified')
    })

    it('should treat a missing certification as awaiting_decision', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: { id: 'APP-001', modelName: 'Test Stove' }
      })

      await approvalsStatusController.handler(mockRequest, mockH)

      const [, viewData] = mockH.view.mock.calls[0]
      expect(viewData.currentStatus).toBe('awaiting_decision')
    })

    it('should handle all four countries', async () => {
      const mockAppliance = {
        id: 'APP-001',
        modelName: 'Test Stove',
        englandCertification: { status: 'certified' },
        scotlandCertification: { status: 'uncertified' },
        walesCertification: { status: 'awaiting_decision' },
        nIrelandCertification: { status: 'awaiting_decision' }
      }

      const countries = ['england', 'scotland', 'wales', 'northern-ireland']
      const expectedCountryNames = [
        'England',
        'Scotland',
        'Wales',
        'Northern Ireland'
      ]

      for (let i = 0; i < countries.length; i++) {
        approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
          data: mockAppliance
        })

        mockRequest.params.country = countries[i]

        await approvalsStatusController.handler(mockRequest, mockH)

        const [, viewData] = mockH.view.mock.calls[i]
        expect(viewData.heading).toContain(expectedCountryNames[i])
      }
    })

    it('should handle appliance not found', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce(
        null
      )

      const result = await approvalsStatusController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(result.statusCode).toBe(404)
    })

    it('should handle API errors', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockRejectedValueOnce(
        new Error('API Error')
      )

      const result = await approvalsStatusController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(result.statusCode).toBe(500)
    })

    it('should set correct radio options for certified status', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          modelName: 'Test Stove',
          englandCertification: { status: 'certified' }
        }
      })

      await approvalsStatusController.handler(mockRequest, mockH)

      const [, viewData] = mockH.view.mock.calls[0]
      expect(viewData.radioOptions.length).toBe(2)
      expect(viewData.radioOptions[0].value).toBe('yes')
      expect(viewData.radioOptions[1].value).toBe('no')
    })
  })

  describe('approvalsStatusDecisionController (POST)', () => {
    it('should send uncertified when decision is yes for certified', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          modelName: 'Test Stove',
          englandCertification: { status: 'certified' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      mockRequest.payload.decision = 'yes'

      const result = await approvalsStatusDecisionController.handler(
        mockRequest,
        mockH
      )

      expect(approvalStatusData.updateCertificationStatus).toHaveBeenCalledWith(
        'APP-001',
        'england',
        'uncertified',
        systemDecidedBy
      )
      expect(result.redirect).toContain('/appliance-record/APP-001')
    })

    it('should send certified when decision is yes for uncertified', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          modelName: 'Test Stove',
          englandCertification: { status: 'uncertified' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      mockRequest.payload.decision = 'yes'

      await approvalsStatusDecisionController.handler(mockRequest, mockH)

      expect(approvalStatusData.updateCertificationStatus).toHaveBeenCalledWith(
        'APP-001',
        'england',
        'certified',
        systemDecidedBy
      )
    })

    it('should use the signed-in user for decidedBy', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'certified' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      mockRequest.auth = {
        credentials: { name: 'Ada', email: 'ada@example.com' }
      }

      await approvalsStatusDecisionController.handler(mockRequest, mockH)

      expect(approvalStatusData.updateCertificationStatus).toHaveBeenCalledWith(
        'APP-001',
        'england',
        'uncertified',
        { name: 'Ada', email: 'ada@example.com' }
      )
    })

    it('should update to certified when awaiting decision and certified selected', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'awaiting_decision' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      mockRequest.payload.decision = 'certified'

      await approvalsStatusDecisionController.handler(mockRequest, mockH)

      expect(approvalStatusData.updateCertificationStatus).toHaveBeenCalledWith(
        'APP-001',
        'england',
        'certified',
        systemDecidedBy
      )
    })

    it('should update to uncertified when awaiting decision and uncertified selected', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'awaiting_decision' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      mockRequest.payload.decision = 'uncertified'

      await approvalsStatusDecisionController.handler(mockRequest, mockH)

      expect(approvalStatusData.updateCertificationStatus).toHaveBeenCalledWith(
        'APP-001',
        'england',
        'uncertified',
        systemDecidedBy
      )
    })

    it('should not update when decision is no', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'certified' }
        }
      })

      mockRequest.payload.decision = 'no'

      const result = await approvalsStatusDecisionController.handler(
        mockRequest,
        mockH
      )

      expect(
        approvalStatusData.updateCertificationStatus
      ).not.toHaveBeenCalled()
      expect(result.redirect).toContain('/appliance-record/APP-001')
    })

    it('should redirect to appliance record on success', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'certified' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockResolvedValueOnce({
        success: true
      })

      const result = await approvalsStatusDecisionController.handler(
        mockRequest,
        mockH
      )

      expect(result.redirect).toBe('/appliance-record/APP-001')
    })

    it('should handle appliance not found', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce(
        null
      )

      const result = await approvalsStatusDecisionController.handler(
        mockRequest,
        mockH
      )

      expect(mockH.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(result.statusCode).toBe(404)
    })

    it('should handle update errors', async () => {
      approvalStatusData.getApplianceForApprovalStatus.mockResolvedValueOnce({
        data: {
          id: 'APP-001',
          englandCertification: { status: 'certified' }
        }
      })
      approvalStatusData.updateCertificationStatus.mockRejectedValueOnce(
        new Error('Update failed')
      )

      const result = await approvalsStatusDecisionController.handler(
        mockRequest,
        mockH
      )

      expect(mockH.view).toHaveBeenCalledWith('error/index', expect.any(Object))
      expect(result.statusCode).toBe(500)
    })
  })
})
