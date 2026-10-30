import { beforeEach, describe, expect, test, vi } from 'vitest'

import { handleActionHistoryRequest } from './controller.js'
import { getApplianceActionHistory } from './action-history-data.js'

vi.mock('./action-history-data.js', () => ({
  getApplianceActionHistory: vi.fn()
}))

// Midday UTC so the formatted date is the same in every timezone
const history = {
  id: 'APP-123',
  name: 'Aarrow Ecoburn 5F plus 4.9kW multi-fuel stove',
  actions: [
    {
      id: 'ACT-3',
      description: 'Hidden from public list',
      completedBy: 'System',
      completedAt: '2026-01-24T12:00:00.000Z'
    },
    {
      id: 'ACT-2',
      description: 'Uncertified on behalf of Northern Ireland',
      completedBy: 'Calvin May',
      completedAt: '2026-01-24T11:00:00.000Z'
    },
    {
      id: 'ACT-1',
      description: 'Certified in Wales',
      completedBy: 'Welsh Government',
      completedAt: '2026-01-22T12:00:00.000Z'
    }
  ]
}

function toolkit() {
  return {
    view: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis()
  }
}

const request = { params: { applianceId: 'APP-123' } }

describe('action history controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the history page with the appliance name in the heading', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history
    })
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    const [template, view] = h.view.mock.calls[0]
    expect(template).toBe('appliance-record/action-history/index')
    expect(view.heading).toBe(
      'Action history for Aarrow Ecoburn 5F plus 4.9kW multi-fuel stove'
    )
    expect(view.pageTitle).toBe(view.heading)
  })

  test('builds Action, Completed by and Date cells in the order given', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history
    })
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    const { rows } = h.view.mock.calls[0][1]
    expect(rows).toEqual([
      [
        { text: 'Hidden from public list' },
        { text: 'System' },
        { text: '24 January 2026' }
      ],
      [
        { text: 'Uncertified on behalf of Northern Ireland' },
        { text: 'Calvin May' },
        { text: '24 January 2026' }
      ],
      [
        { text: 'Certified in Wales' },
        { text: 'Welsh Government' },
        { text: '22 January 2026' }
      ]
    ])
  })

  test('links back to the appliance record with an absolute path', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history
    })
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    const view = h.view.mock.calls[0][1]
    expect(view.returnHref).toBe('/appliance-record/APP-123')
    expect(view.backLink).toEqual({ href: '/appliance-record/APP-123' })
  })

  test('encodes the appliance id in the return link', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history
    })
    const h = toolkit()

    await handleActionHistoryRequest({ params: { applianceId: 'A B' } }, h)

    expect(h.view.mock.calls[0][1].returnHref).toBe('/appliance-record/A%20B')
  })

  test('has no rows when nothing has been recorded', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: { ...history, actions: [] }
    })
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    expect(h.view.mock.calls[0][1].rows).toEqual([])
  })

  test('requests the page from the query and builds the pager from pagination', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history,
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 }
    })
    const h = toolkit()

    await handleActionHistoryRequest(
      { params: { applianceId: 'APP-123' }, query: { page: 2 } },
      h
    )

    expect(getApplianceActionHistory).toHaveBeenCalledWith('APP-123', 2)
    const view = h.view.mock.calls[0][1]
    expect(view.hasPagination).toBe(true)
    expect(view.previous.href).toBe(
      '/appliance-record/APP-123/action-history?page=1'
    )
    expect(view.next.href).toBe(
      '/appliance-record/APP-123/action-history?page=3'
    )
    expect(view.paginationItems).toHaveLength(3)
  })

  test('defaults to page 1 and hides the pager for a single page', async () => {
    getApplianceActionHistory.mockResolvedValue({
      success: true,
      data: history,
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 }
    })
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    expect(getApplianceActionHistory).toHaveBeenCalledWith('APP-123', 1)
    expect(h.view.mock.calls[0][1].hasPagination).toBe(false)
  })

  test('renders a not-found page when the appliance does not exist', async () => {
    getApplianceActionHistory.mockRejectedValue(
      Object.assign(new Error('Backend GET failed: 404'), { status: 404 })
    )
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Appliance not found'
    })
    expect(h.code).toHaveBeenCalledWith(404)
  })

  test('renders the generic error page when the backend fails', async () => {
    getApplianceActionHistory.mockRejectedValue(
      Object.assign(new Error('Backend GET failed: 500'), { status: 500 })
    )
    const h = toolkit()

    await handleActionHistoryRequest(request, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
