import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleFuelRecordsRequest } from './controller.js'
import { getFuelRecords } from './fuel-records-data.js'

vi.mock('./fuel-records-data.js', () => ({
  getFuelRecords: vi.fn()
}))

describe('fuel-records controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders records with fuel IDs, brand names, statuses, and view links', async () => {
    getFuelRecords.mockResolvedValue({
      data: [
        { id: '7756-0001', brandName: 'Oak Briquettes', status: 'live' },
        { id: '1234-0002', brandName: 'Birch Logs', status: 'pending' }
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleFuelRecordsRequest(
      {
        method: 'get',
        query: { keywords: 'Oak', filters: 'live', page: '1' }
      },
      h
    )

    expect(getFuelRecords).toHaveBeenCalledWith({
      keywords: 'Oak',
      page: 1,
      filters: ['live'],
      limit: 10
    })

    expect(h.view).toHaveBeenCalledWith(
      'fuel-records/index',
      expect.objectContaining({
        keywords: 'Oak',
        pageNumber: 1,
        totalPages: 1,
        hasPagination: false
      })
    )

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.fuelRows).toHaveLength(2)
    expect(viewData.fuelRows[0][0]).toMatchObject({
      text: '0001'
    })
    expect(viewData.fuelRows[0][1]).toMatchObject({
      text: 'Oak Briquettes'
    })
    expect(viewData.fuelRows[0][2].html).toContain('Live')
    expect(viewData.fuelRows[0][3].html).toContain('/fuel-record/7756-0001')
    expect(viewData.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'pending', checked: false }),
        expect.objectContaining({ value: 'live', checked: true })
      ])
    )
  })

  it('handles multiple checkbox filters and preserves them in pagination URLs', async () => {
    getFuelRecords.mockResolvedValue({
      data: [
        { id: '2026-1', brandName: 'Oak Briquettes', status: 'live' },
        { id: '2026-2', brandName: 'Birch Logs', status: 'pending' }
      ],
      pagination: { page: 1, limit: 10, total: 25, totalPages: 3 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleFuelRecordsRequest(
      {
        method: 'get',
        query: { keywords: 'logs', filters: ['pending', 'live'], page: '1' }
      },
      h
    )

    expect(getFuelRecords).toHaveBeenCalledWith({
      keywords: 'logs',
      page: 1,
      filters: ['pending', 'live'],
      limit: 10
    })

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.hasPagination).toBe(true)
    expect(viewData.next).toEqual({
      href: '/fuel-records?keywords=logs&filters=pending%2Clive&page=2',
      text: 'Next'
    })
    expect(viewData.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'pending', checked: true }),
        expect.objectContaining({ value: 'live', checked: true })
      ])
    )
  })

  it('supports POST payload queries and clamps invalid page numbers to 1', async () => {
    getFuelRecords.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleFuelRecordsRequest(
      {
        method: 'post',
        payload: {
          keywords: 'Smokeless',
          filters: 'hidden,rejected',
          page: '0'
        }
      },
      h
    )

    expect(getFuelRecords).toHaveBeenCalledWith({
      keywords: 'Smokeless',
      page: 1,
      filters: ['hidden', 'rejected'],
      limit: 10
    })
  })

  it('renders the error view with 500 status when fetching fuel records fails', async () => {
    getFuelRecords.mockRejectedValue(new Error('Backend unavailable'))

    const code = vi.fn(() => 'error-rendered')
    const h = { view: vi.fn(() => ({ code })) }

    await handleFuelRecordsRequest({ method: 'get', query: {} }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: expect.any(String)
    })
    expect(code).toHaveBeenCalledWith(500)
  })
})
