import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleApplianceRecordsRequest } from './controller.js'
import { getApplianceRecords } from './appliance-records-data.js'

vi.mock('./appliance-records-data.js', () => ({
  getApplianceRecords: vi.fn()
}))

describe('appliance-records controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders records with appliance IDs and view links', async () => {
    getApplianceRecords.mockResolvedValue({
      data: [
        { id: '7756-0001', name: 'Alpha stove', status: 'live' },
        { id: '1234-0002', name: 'Beta stove', status: 'pending' }
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleApplianceRecordsRequest(
      {
        method: 'get',
        query: { keywords: 'stove', filters: 'live', page: '1' }
      },
      h
    )

    expect(getApplianceRecords).toHaveBeenCalledWith({
      keywords: 'stove',
      page: 1,
      filters: ['live'],
      limit: 10
    })

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.applianceRows).toHaveLength(2)
    expect(viewData.applianceRows[0][0]).toMatchObject({
      text: '0001'
    })
    expect(viewData.applianceRows[0][1]).toMatchObject({
      text: 'Alpha stove'
    })
    expect(viewData.applianceRows[0][3].html).toContain(
      '/appliance-record/7756-0001'
    )
    expect(viewData.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'pending' }),
        expect.objectContaining({ value: 'live', checked: true })
      ])
    )
  })

  it('escapes HTML special characters in appliance name inside the view link markup', async () => {
    getApplianceRecords.mockResolvedValue({
      data: [
        {
          id: '7756-0001',
          name: '<script>alert("xss")</script>',
          status: 'live'
        }
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleApplianceRecordsRequest({ method: 'get', query: {} }, h)

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.applianceRows[0][1]).toEqual({
      text: '<script>alert("xss")</script>'
    })
    expect(viewData.applianceRows[0][3].html).not.toContain('<script>')
    expect(viewData.applianceRows[0][3].html).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('handles multiple checkbox filters correctly', async () => {
    getApplianceRecords.mockResolvedValue({
      data: [
        { id: 'APP-1', name: 'Alpha stove', status: 'live' },
        { id: 'APP-2', name: 'Beta stove', status: 'pending' }
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleApplianceRecordsRequest(
      {
        method: 'get',
        query: { filters: ['pending', 'live'], page: '1' }
      },
      h
    )

    expect(getApplianceRecords).toHaveBeenCalledWith({
      keywords: '',
      page: 1,
      filters: ['pending', 'live'],
      limit: 10
    })

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'pending', checked: true }),
        expect.objectContaining({ value: 'live', checked: true })
      ])
    )
  })

  it('supports POST payload queries and clamps invalid page numbers to 1', async () => {
    getApplianceRecords.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleApplianceRecordsRequest(
      {
        method: 'post',
        payload: {
          keywords: 'Woodburner',
          filters: 'hidden,rejected',
          page: '0'
        }
      },
      h
    )

    expect(getApplianceRecords).toHaveBeenCalledWith({
      keywords: 'Woodburner',
      page: 1,
      filters: ['hidden', 'rejected'],
      limit: 10
    })
  })

  it('clamps the displayed page number when requested page exceeds totalPages', async () => {
    getApplianceRecords.mockResolvedValue({
      data: [],
      pagination: { page: 99, limit: 10, total: 25, totalPages: 3 }
    })

    const h = { view: vi.fn(() => 'rendered') }

    await handleApplianceRecordsRequest(
      {
        method: 'get',
        query: { page: '99' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-records/index',
      expect.objectContaining({
        pageNumber: 3,
        totalPages: 3,
        countText: 'Showing 21 to 25 of 25 records'
      })
    )
  })

  it('renders the error view with 500 status when backend response contract is invalid', async () => {
    getApplianceRecords.mockResolvedValue({ data: null })

    const code = vi.fn(() => 'error-rendered')
    const h = { view: vi.fn(() => ({ code })) }

    await handleApplianceRecordsRequest({ method: 'get', query: {} }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: expect.any(String)
    })
    expect(code).toHaveBeenCalledWith(500)
  })

  it('renders the error view with 500 status when fetching appliance records fails', async () => {
    getApplianceRecords.mockRejectedValue(new Error('Backend unavailable'))

    const code = vi.fn(() => 'error-rendered')
    const h = { view: vi.fn(() => ({ code })) }

    await handleApplianceRecordsRequest({ method: 'get', query: {} }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: expect.any(String)
    })
    expect(code).toHaveBeenCalledWith(500)
  })
})
