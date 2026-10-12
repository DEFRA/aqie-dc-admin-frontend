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
        { id: 'APP-1', name: 'Alpha stove', status: 'live' },
        { id: 'APP-2', name: 'Beta stove', status: 'pending' }
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
      text: 'APP-1'
    })
    expect(viewData.applianceRows[0][1]).toMatchObject({
      text: 'Alpha stove'
    })
    expect(viewData.applianceRows[0][3].html).toContain(
      '/appliance-record/APP-1'
    )
    expect(viewData.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'pending' }),
        expect.objectContaining({ value: 'live', checked: true })
      ])
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
})
