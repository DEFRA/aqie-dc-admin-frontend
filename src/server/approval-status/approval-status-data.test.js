import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as approvalStatusData from './approval-status-data.js'
import { fetchJson, patchJson } from '../common/api/api.js'

// Mock the API module
vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('Approval Status Data Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getApplianceForApprovalStatus', () => {
    it('should fetch appliance by ID', async () => {
      const mockAppliance = {
        id: 'APP-001',
        modelName: 'Test Stove',
        englandCertification: { status: 'certified' }
      }

      fetchJson.mockResolvedValueOnce(mockAppliance)

      const result =
        await approvalStatusData.getApplianceForApprovalStatus('APP-001')

      expect(fetchJson).toHaveBeenCalledWith('/appliances/APP-001')
      expect(result).toEqual(mockAppliance)
    })

    it('should handle appliance not found', async () => {
      fetchJson.mockResolvedValueOnce(null)

      const result =
        await approvalStatusData.getApplianceForApprovalStatus('APP-999')

      expect(result).toBeNull()
    })

    it('should encode appliance ID in URL', async () => {
      fetchJson.mockResolvedValueOnce({})

      await approvalStatusData.getApplianceForApprovalStatus('APP-001-ENCODED')

      expect(fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('APP-001-ENCODED')
      )
    })

    it('should handle API errors', async () => {
      const error = new Error('API error')
      fetchJson.mockRejectedValueOnce(error)

      await expect(
        approvalStatusData.getApplianceForApprovalStatus('APP-001')
      ).rejects.toThrow('API error')
    })
  })

  describe('updateCertificationStatus', () => {
    const decidedBy = { name: 'Reviewer', email: 'reviewer@example.com' }

    it('should patch the country certification endpoint', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'APP-001', englandCertification: { status: 'certified' } }
      }

      patchJson.mockResolvedValueOnce(mockResponse)

      const result = await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'certified',
        decidedBy
      )

      expect(patchJson).toHaveBeenCalledWith(
        '/appliances/APP-001/certification/england',
        { status: 'certified', decidedBy }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should use the country in the path', async () => {
      patchJson.mockResolvedValue({ success: true })

      const countries = ['england', 'scotland', 'wales', 'northern-ireland']

      for (const country of countries) {
        await approvalStatusData.updateCertificationStatus(
          'APP-001',
          country,
          'certified',
          decidedBy
        )

        expect(patchJson).toHaveBeenCalledWith(
          `/appliances/APP-001/certification/${country}`,
          expect.objectContaining({ status: 'certified' })
        )
      }
    })

    it('should send uncertified without remapping', async () => {
      patchJson.mockResolvedValueOnce({ success: true })

      await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'uncertified',
        decidedBy
      )

      expect(patchJson).toHaveBeenCalledWith(
        '/appliances/APP-001/certification/england',
        { status: 'uncertified', decidedBy }
      )
    })

    it('should encode appliance ID in URL', async () => {
      patchJson.mockResolvedValueOnce({ success: true })

      await approvalStatusData.updateCertificationStatus(
        'APP-001-ENCODED',
        'england',
        'certified',
        decidedBy
      )

      expect(patchJson).toHaveBeenCalledWith(
        expect.stringContaining('APP-001-ENCODED'),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      patchJson.mockRejectedValueOnce(new Error('API error'))

      await expect(
        approvalStatusData.updateCertificationStatus(
          'APP-001',
          'england',
          'certified',
          decidedBy
        )
      ).rejects.toThrow('API error')
    })
  })
})
