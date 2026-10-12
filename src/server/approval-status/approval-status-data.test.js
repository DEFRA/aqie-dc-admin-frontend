import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as approvalStatusData from './approval-status-data.js'

// Mock the API module
vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

import { fetchJson, patchJson } from '../common/api/api.js'

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

      const result = await approvalStatusData.getApplianceForApprovalStatus('APP-001')

      expect(fetchJson).toHaveBeenCalledWith(
        '/appliances/APP-001'
      )
      expect(result).toEqual(mockAppliance)
    })

    it('should handle appliance not found', async () => {
      fetchJson.mockResolvedValueOnce(null)

      const result = await approvalStatusData.getApplianceForApprovalStatus('APP-999')

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

    it('should patch the country certification field', async () => {
      const mockResponse = {
        id: 'APP-001',
        englandCertification: { status: 'certified' }
      }

      patchJson.mockResolvedValueOnce(mockResponse)

      const result = await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'certified',
        decidedBy
      )

      expect(patchJson).toHaveBeenCalledWith('/appliances/APP-001', {
        englandCertification: {
          status: 'certified',
          decidedAt: expect.any(String),
          decidedBy
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should map each country to its certification field', async () => {
      patchJson.mockResolvedValue({ success: true })

      const countryFields = {
        england: 'englandCertification',
        scotland: 'scotlandCertification',
        wales: 'walesCertification',
        'northern-ireland': 'nIrelandCertification'
      }

      for (const [country, field] of Object.entries(countryFields)) {
        await approvalStatusData.updateCertificationStatus(
          'APP-001',
          country,
          'certified',
          decidedBy
        )

        expect(patchJson).toHaveBeenCalledWith(
          '/appliances/APP-001',
          expect.objectContaining({
            [field]: expect.objectContaining({ status: 'certified' })
          })
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
        '/appliances/APP-001',
        expect.objectContaining({
          englandCertification: expect.objectContaining({
            status: 'uncertified'
          })
        })
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
