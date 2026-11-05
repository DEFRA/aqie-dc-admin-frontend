import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleRebrandNameRequest,
  handleRebrandNameDecisionRequest
} from './controller.js'

const { getFuelForRebrandNameMock, saveRebrandNameMock } = vi.hoisted(() => ({
  getFuelForRebrandNameMock: vi.fn(),
  saveRebrandNameMock: vi.fn()
}))

vi.mock('./rebrand-name-data.js', () => ({
  getFuelForRebrandName: getFuelForRebrandNameMock,
  saveRebrandName: saveRebrandNameMock
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Grillaedin White Quebracho',
  brandName: 'Grillaedin White Quebracho',
  supplierType: 'Rebrand',
  technicalReview: {
    status: 'in_review',
    listingChecks: { fuelDetails: null }
  }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleRebrandNameRequest', () => {
  beforeEach(() => {
    getFuelForRebrandNameMock.mockReset()
    saveRebrandNameMock.mockReset()
  })

  test('renders the page with the current rebranded name pre-populated', async () => {
    getFuelForRebrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleRebrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'rebrand-name/index',
      expect.objectContaining({
        pageTitle: 'What is the rebranded name?',
        formValue: 'Grillaedin White Quebracho'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForRebrandNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleRebrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleRebrandNameDecisionRequest', () => {
  beforeEach(() => {
    getFuelForRebrandNameMock.mockReset()
    saveRebrandNameMock.mockReset()
  })

  test('saves the updated rebranded name and redirects to fuel details', async () => {
    saveRebrandNameMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleRebrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { rebrandName: '  Grillaedin White Quebracho Pro  ' }
      },
      h
    )

    expect(saveRebrandNameMock).toHaveBeenCalledWith(
      'FUEL-1',
      'Grillaedin White Quebracho Pro'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when rebranded name is empty', async () => {
    getFuelForRebrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleRebrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { rebrandName: '   ' }
      },
      h
    )

    expect(saveRebrandNameMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'rebrand-name/index',
      expect.objectContaining({
        pageTitle: 'Error: What is the rebranded name?',
        error: {
          field: 'rebrandName',
          message: 'Enter the rebranded name',
          href: '#rebrand-name'
        },
        formValue: '   '
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the fuel details page', async () => {
    getFuelForRebrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleRebrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'rebrand-name/index',
      expect.objectContaining({
        fuelDetailsHref: '/review-fuel/FUEL-1/fuel-details'
      })
    )
  })

  test('renders error page when save fails', async () => {
    saveRebrandNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleRebrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { rebrandName: 'Updated rebrand name' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
