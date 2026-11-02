import { vi } from 'vitest'
import * as fuelService from '../common/services/common-fuel-service.js'
import {
  getFuel,
  saveManufacturerLetterResult
} from './manufacturer-letter-data.js'

const { getFuelTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getFuelTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.spyOn(fuelService, 'getFuelTechnicalReview').mockImplementation(
  getFuelTechnicalReviewMock
)

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

describe('manufacturer-letter-data', () => {
  beforeEach(() => {
    getFuelTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  describe('getFuel', () => {
    test('fetches fuel technical review data from the correct endpoint', async () => {
      getFuelTechnicalReviewMock.mockResolvedValue({
        data: { id: 'FUEL-1', technicalReview: {} }
      })

      await getFuel('FUEL-1')

      expect(getFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-1')
    })

    test('returns the response from getFuelTechnicalReview', async () => {
      const mockData = {
        data: { id: 'FUEL-1', name: 'Test Fuel', technicalReview: {} }
      }
      getFuelTechnicalReviewMock.mockResolvedValue(mockData)

      const result = await getFuel('FUEL-1')

      expect(result).toEqual(mockData)
    })
  })

  describe('saveManufacturerLetterResult', () => {
    test('sends pass result to the correct endpoint', async () => {
      patchJsonMock.mockResolvedValue({ success: true })

      await saveManufacturerLetterResult('FUEL-1', true)

      expect(patchJsonMock).toHaveBeenCalledWith(
        '/fuels/FUEL-1/technical-review/checks',
        { check: 'manufacturerLetter', result: true }
      )
    })

    test('sends fail result to the correct endpoint', async () => {
      patchJsonMock.mockResolvedValue({ success: true })

      await saveManufacturerLetterResult('FUEL-1', false)

      expect(patchJsonMock).toHaveBeenCalledWith(
        '/fuels/FUEL-1/technical-review/checks',
        { check: 'manufacturerLetter', result: false }
      )
    })

    test('encodes fuel ID in URL', async () => {
      patchJsonMock.mockResolvedValue({ success: true })

      await saveManufacturerLetterResult('FUEL-WITH-SPACES', true)

      expect(patchJsonMock).toHaveBeenCalledWith(
        '/fuels/FUEL-WITH-SPACES/technical-review/checks',
        expect.any(Object)
      )
    })
  })
})
