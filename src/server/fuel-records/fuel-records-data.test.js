import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFuelRecords } from './fuel-records-data.js'
import { fetchJson } from '../common/api/api.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn()
}))

describe('fuel-records-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls /admin/fuels with default pagination parameters when no arguments are passed', async () => {
    const mockResponse = {
      data: [{ id: '2026-1', brandName: 'Oak Briquettes', status: 'live' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    }
    fetchJson.mockResolvedValue(mockResponse)

    const result = await getFuelRecords()

    expect(fetchJson).toHaveBeenCalledWith('/admin/fuels?page=1&limit=10')
    expect(result).toEqual(mockResponse)
  })

  it('includes trimmed keywords and normalised comma-separated status filters in the query string', async () => {
    fetchJson.mockResolvedValue({ data: [], pagination: {} })

    await getFuelRecords({
      keywords: '  Oak & Birch-1.0  ',
      page: 2,
      limit: 20,
      filters: [' Live ', 'PENDING', '', null]
    })

    expect(fetchJson).toHaveBeenCalledWith(
      '/admin/fuels?page=2&limit=20&q=Oak+%26+Birch-1.0&status=live%2Cpending'
    )
  })

  it('short-circuits and returns empty results without calling fetchJson when keywords exceed 50 characters', async () => {
    const longKeyword = 'a'.repeat(51)

    const result = await getFuelRecords({
      keywords: longKeyword,
      page: 3,
      limit: 15
    })

    expect(fetchJson).not.toHaveBeenCalled()
    expect(result).toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 0
      }
    })
  })

  it('short-circuits and returns empty results without calling fetchJson when keywords contain unsafe characters', async () => {
    const result = await getFuelRecords({
      keywords: '<script>alert(1)</script>',
      page: 1,
      limit: 10
    })

    expect(fetchJson).not.toHaveBeenCalled()
    expect(result).toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    })
  })
})
