import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleOriginalManufacturerRequest,
  handleOriginalManufacturerDecisionRequest
} from './controller.js'

const { getFuelForOriginalManufacturerMock, saveOriginalManufacturerMock } =
  vi.hoisted(() => ({
    getFuelForOriginalManufacturerMock: vi.fn(),
    saveOriginalManufacturerMock: vi.fn()
  }))

vi.mock('./original-manufacturer-data.js', () => ({
  getFuelForOriginalManufacturer: getFuelForOriginalManufacturerMock,
  saveOriginalManufacturer: saveOriginalManufacturerMock
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Josper S.A.U. Fuel',
  originalFuel: {
    manufacturer: 'Josper S.A.U.'
  },
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

describe('#handleOriginalManufacturerRequest', () => {
  beforeEach(() => {
    getFuelForOriginalManufacturerMock.mockReset()
    saveOriginalManufacturerMock.mockReset()
  })

  test('renders the page with the current original manufacturer pre-populated', async () => {
    getFuelForOriginalManufacturerMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleOriginalManufacturerRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'original-manufacturer/index',
      expect.objectContaining({
        pageTitle: 'Original fuel manufacturer',
        formValue: 'Josper S.A.U.'
      })
    )
  })

  test('sets the cancel link back to the fuel details page', async () => {
    getFuelForOriginalManufacturerMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleOriginalManufacturerRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'original-manufacturer/index',
      expect.objectContaining({
        fuelDetailsHref: '/review-fuel/FUEL-1/fuel-details'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForOriginalManufacturerMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleOriginalManufacturerRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleOriginalManufacturerDecisionRequest', () => {
  beforeEach(() => {
    getFuelForOriginalManufacturerMock.mockReset()
    saveOriginalManufacturerMock.mockReset()
  })

  test('saves the updated original manufacturer and redirects to fuel details', async () => {
    saveOriginalManufacturerMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleOriginalManufacturerDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { manufacturer: '  Original Co  ' }
      },
      h
    )

    expect(saveOriginalManufacturerMock).toHaveBeenCalledWith(
      'FUEL-1',
      'Original Co'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when original manufacturer is empty', async () => {
    getFuelForOriginalManufacturerMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleOriginalManufacturerDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { manufacturer: '   ' }
      },
      h
    )

    expect(saveOriginalManufacturerMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'original-manufacturer/index',
      expect.objectContaining({
        pageTitle: 'Error: Original fuel manufacturer',
        error: {
          field: 'manufacturer',
          message: 'Enter the original fuel manufacturer',
          href: '#original-fuel-manufacturer'
        },
        formValue: '   '
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveOriginalManufacturerMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleOriginalManufacturerDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: { originalFuel: { manufacturer: 'Updated manufacturer' } }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
