import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getApplianceActionHistory } from './action-history-data.js'
import { fetchJson } from '../../common/api/api.js'

vi.mock('../../common/api/api.js', () => ({
  fetchJson: vi.fn()
}))

describe('getApplianceActionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches the admin action history endpoint', async () => {
    fetchJson.mockResolvedValue({ success: true, data: {} })

    await getApplianceActionHistory('APP-1')

    expect(fetchJson).toHaveBeenCalledWith(
      '/api/admin/appliances/APP-1/action-history'
    )
  })

  test('encodes the appliance id', async () => {
    fetchJson.mockResolvedValue({ success: true, data: {} })

    await getApplianceActionHistory('APP/1 2')

    expect(fetchJson).toHaveBeenCalledWith(
      '/api/admin/appliances/APP%2F1%202/action-history'
    )
  })

  test('returns the backend response unchanged', async () => {
    const response = { success: true, data: { id: 'APP-1', actions: [] } }
    fetchJson.mockResolvedValue(response)

    await expect(getApplianceActionHistory('APP-1')).resolves.toBe(response)
  })
})
