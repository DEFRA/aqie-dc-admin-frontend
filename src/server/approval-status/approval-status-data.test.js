import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as approvalStatusData from '../approval-status-data.js'

// Mock the API module
vi.mock('../../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

import { fetchJson } from '../../common/api/api.js'

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
    it('should update certification status for a country', async () => {
      const mockResponse = {
        id: 'APP-001',
        englandCertification: { status: 'certified' }
      }

      fetchJson.mockResolvedValueOnce(mockResponse)

      const result = await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'certified'
      )

      expect(fetchJson).toHaveBeenCalledWith(
        '/appliances/APP-001/certification/england',
        {
          method: 'POST',
          body: JSON.stringify({ status: 'certified' })
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle all valid countries', async () => {
      fetchJson.mockResolvedValue({ success: true })

      const countries = ['england', 'scotland', 'wales', 'northern-ireland']

      for (const country of countries) {
        await approvalStatusData.updateCertificationStatus(
          'APP-001',
          country,
          'certified'
        )

        expect(fetchJson).toHaveBeenCalledWith(
          expect.stringContaining(`/certification/${country}`),
          expect.any(Object)
        )
      }
    })

    it('should handle uncertified status', async () => {
      fetchJson.mockResolvedValueOnce({ success: true })

      await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'uncertified'
      )

      expect(fetchJson).toHaveBeenCalledWith(
        expect.any(String),
        {
          method: 'POST',
          body: JSON.stringify({ status: 'uncertified' })
        }
      )
    })

    it('should handle awaiting_decision status', async () => {
      fetchJson.mockResolvedValueOnce({ success: true })

      await approvalStatusData.updateCertificationStatus(
        'APP-001',
        'england',
        'awaiting_decision'
      )

      expect(fetchJson).toHaveBeenCalledWith(
        expect.any(String),
        {
          method: 'POST',
          body: JSON.stringify({ status: 'awaiting_decision' })
        }
      )
    })

    it('should encode appliance ID in URL', async () => {
      fetchJson.mockResolvedValueOnce({ success: true })

      await approvalStatusData.updateCertificationStatus(
        'APP-001-ENCODED',
        'england',
        'certified'
      )

      expect(fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('APP-001-ENCODED'),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      const error = new Error('API error')
      fetchJson.mockRejectedValueOnce(error)

      await expect(
        approvalStatusData.updateCertificationStatus('APP-001', 'england', 'certified')
      ).rejects.toThrow('API error')
    })
  })
})
