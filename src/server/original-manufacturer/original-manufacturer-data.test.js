import { describe, expect, test, vi } from 'vitest'
import {
  getFuelForOriginalManufacturer,
  saveOriginalManufacturer
} from './original-manufacturer-data.js'
import { patchJson } from '../common/api/api.js'
import { getFuelTechnicalReview } from '../common/services/common-fuel-service.js'

vi.mock('../common/api/api.js', () => ({
  patchJson: vi.fn()
}))

vi.mock('../common/services/common-fuel-service.js', () => ({
  getFuelTechnicalReview: vi.fn()
}))

describe('original-manufacturer-data', () => {
  test('loads the current fuel for the original manufacturer page', async () => {
    const fuel = { id: 'FUEL-1', originalManu: 'Josper S.A.U.' }
    getFuelTechnicalReview.mockResolvedValue({ data: fuel })

    await getFuelForOriginalManufacturer('FUEL-1')

    expect(getFuelTechnicalReview).toHaveBeenCalledWith('FUEL-1')
  })

  test('saves the original manufacturer without overwriting required originalFuel fields', async () => {
    patchJson.mockResolvedValue({ success: true })
    getFuelTechnicalReview.mockResolvedValue({
      data: {
        originalFuel: {
          name: 'Fuel name',
          isChangedOrMixed: false
        }
      }
    })

    await saveOriginalManufacturer('FUEL-1', 'Josper S.A.U.')

    expect(patchJson).toHaveBeenCalledWith('/fuels/FUEL-1', {
      originalFuel: {
        name: 'Fuel name',
        isChangedOrMixed: false,
        manufacturer: 'Josper S.A.U.'
      }
    })
  })
})
