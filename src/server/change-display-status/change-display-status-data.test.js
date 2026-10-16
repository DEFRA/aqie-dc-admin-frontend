/**
 * Tests for the data access layer used by the visibility confirmation flow.
 *
 * The tests verify that the frontend reads the admin endpoint and posts the final
 * boolean state to the backend visibility patch route.
 */
import { describe, expect, test, vi } from 'vitest'
import {
  getApplianceVisibilityState,
  saveApplianceVisibility
} from './change-display-status-data.js'
import { fetchJson, patchJson } from '../common/api/api.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('change display status data', () => {
  test('loads the current appliance visibility state from the admin endpoint', async () => {
    fetchJson.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Aarrow Ecoburn',
        isVisibleToPublic: true
      }
    })

    const result = await getApplianceVisibilityState('APP-123')

    expect(fetchJson).toHaveBeenCalledWith('/api/admin/appliances/APP-123')
    expect(result.data.isVisibleToPublic).toBe(true)
  })

  test('sends the visibility patch to the backend with a boolean JSON payload', async () => {
    patchJson.mockResolvedValue({ success: true })

    const result = await saveApplianceVisibility('APP-123', false)

    expect(patchJson).toHaveBeenCalledWith('/appliances/APP-123/visibility', {
      isVisibleToPublic: false
    })
    expect(result).toEqual({ success: true })
  })
})
