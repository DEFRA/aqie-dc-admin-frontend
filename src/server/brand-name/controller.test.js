import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleBrandNameRequest,
  handleBrandNameDecisionRequest
} from './controller.js'

const { getFuelForBrandNameMock, saveBrandNameMock } = vi.hoisted(() => ({
  getFuelForBrandNameMock: vi.fn(),
  saveBrandNameMock: vi.fn()
}))

vi.mock('./brand-name-data.js', () => ({
  getFuelForBrandName: getFuelForBrandNameMock,
  saveBrandName: saveBrandNameMock
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Premium Unleaded',
  brandName: 'Premium Unleaded',
  supplierType: 'Manufacturer',
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

describe('#handleBrandNameRequest', () => {
  beforeEach(() => {
    getFuelForBrandNameMock.mockReset()
    saveBrandNameMock.mockReset()
  })

  test('renders the page with the current brand name pre-populated', async () => {
    getFuelForBrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleBrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'brand-name/index',
      expect.objectContaining({
        pageTitle: 'What is the brand name?',
        formValue: 'Premium Unleaded'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForBrandNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleBrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleBrandNameDecisionRequest', () => {
  beforeEach(() => {
    getFuelForBrandNameMock.mockReset()
    saveBrandNameMock.mockReset()
  })

  test('saves the updated brand name and redirects to fuel details', async () => {
    saveBrandNameMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { brandName: '  Premium Plus  ' }
      },
      h
    )

    expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-1', 'Premium Plus')
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when brand name is empty', async () => {
    getFuelForBrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { brandName: '   ' }
      },
      h
    )

    expect(saveBrandNameMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'brand-name/index',
      expect.objectContaining({
        pageTitle: 'Error: What is the brand name?',
        error: {
          field: 'brandName',
          message: 'Enter the brand name',
          href: '#brandName'
        },
        formValue: '   '
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the fuel details page', async () => {
    getFuelForBrandNameMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleBrandNameRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'brand-name/index',
      expect.objectContaining({
        fuelDetailsHref: '/review-fuel/FUEL-1/fuel-details'
      })
    )
  })

  test('renders error page when save fails', async () => {
    saveBrandNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { brandName: 'Updated brand name' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
