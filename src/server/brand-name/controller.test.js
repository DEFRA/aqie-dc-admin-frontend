import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleBrandNameRequest,
  handleBrandNameDecisionRequest
} from './controller.js'

const { getFuelMock, saveBrandNameMock } = vi.hoisted(() => ({
  getFuelMock: vi.fn(),
  saveBrandNameMock: vi.fn()
}))

vi.mock('./brand-name-data.js', () => ({
  getFuel: getFuelMock,
  saveBrandName: saveBrandNameMock
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Premium Fuel',
  brandName: 'Premium Fuel',
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

function mockRequest(path, fuelId, payload = null) {
  return {
    params: { fuelId },
    payload,
    route: { path }
  }
}

describe('Brand-Name Route: /brand-name (Manufacturer)', () => {
  beforeEach(() => {
    getFuelMock.mockReset()
    saveBrandNameMock.mockReset()
  })

  describe('GET /brand-name', () => {
    test('renders page with manufacturer heading', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameRequest(
        mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1'),
        h
      )

      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          pageTitle: 'What is the brand name?'
        })
      )
    })

    test('pre-populates form with current brand name', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameRequest(
        mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1'),
        h
      )

      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          formValue: 'Premium Fuel'
        })
      )
    })
  })

  describe('POST /brand-name', () => {
    test('saves brand name and redirects', async () => {
      saveBrandNameMock.mockResolvedValue({ success: true })
      const h = toolkit()

      await handleBrandNameDecisionRequest(
        mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
          brandName: '  New Brand  '
        }),
        h
      )

      expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-1', 'New Brand')
      expect(h.redirect).toHaveBeenCalledWith(
        '/review-fuel/FUEL-1/fuel-details'
      )
    })

    test('rejects empty brand name with manufacturer error message', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameDecisionRequest(
        mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
          brandName: '   '
        }),
        h
      )

      expect(saveBrandNameMock).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          error: {
            field: 'brandName',
            message: 'Enter the brand name',
            href: '#brand-name'
          }
        })
      )
    })
  })
})

describe('Rebrand-Name Route: /rebrand-name (Rebrand)', () => {
  beforeEach(() => {
    getFuelMock.mockReset()
    saveBrandNameMock.mockReset()
  })

  describe('GET /rebrand-name', () => {
    test('renders page with rebrand heading', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameRequest(
        mockRequest('/review-fuel/{fuelId}/rebrand-name', 'FUEL-1'),
        h
      )

      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          pageTitle: 'What is the rebranded name?'
        })
      )
    })

    test('pre-populates form with current rebrand name', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameRequest(
        mockRequest('/review-fuel/{fuelId}/rebrand-name', 'FUEL-1'),
        h
      )

      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          formValue: 'Premium Fuel'
        })
      )
    })
  })

  describe('POST /rebrand-name', () => {
    test('saves rebranded name and redirects', async () => {
      saveBrandNameMock.mockResolvedValue({ success: true })
      const h = toolkit()

      await handleBrandNameDecisionRequest(
        mockRequest('/review-fuel/{fuelId}/rebrand-name', 'FUEL-1', {
          rebrandName: '  New Rebrand  '
        }),
        h
      )

      expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-1', 'New Rebrand')
      expect(h.redirect).toHaveBeenCalledWith(
        '/review-fuel/FUEL-1/fuel-details'
      )
    })

    test('rejects empty rebrand name with rebrand error message', async () => {
      getFuelMock.mockResolvedValue({ data: fuel })
      const h = toolkit()

      await handleBrandNameDecisionRequest(
        mockRequest('/review-fuel/{fuelId}/rebrand-name', 'FUEL-1', {
          rebrandName: '   '
        }),
        h
      )

      expect(saveBrandNameMock).not.toHaveBeenCalled()
      expect(h.view).toHaveBeenCalledWith(
        'brand-name/index',
        expect.objectContaining({
          error: {
            field: 'rebrandName',
            message: 'Enter the rebranded name',
            href: '#rebrand-name'
          }
        })
      )
    })
  })
})

describe('Shared Behavior: Both Routes', () => {
  beforeEach(() => {
    getFuelMock.mockReset()
    saveBrandNameMock.mockReset()
  })

  test('both routes update the same brandName database field', async () => {
    saveBrandNameMock.mockResolvedValue({ success: true })
    const h = toolkit()

    // brand-name route
    await handleBrandNameDecisionRequest(
      mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
        brandName: 'Value A'
      }),
      h
    )

    // rebrand-name route
    await handleBrandNameDecisionRequest(
      mockRequest('/review-fuel/{fuelId}/rebrand-name', 'FUEL-2', {
        rebrandName: 'Value B'
      }),
      h
    )

    // Both call saveBrandName with same DB field
    expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-1', 'Value A')
    expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-2', 'Value B')
  })

  test('handles backend error on GET', async () => {
    getFuelMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleBrandNameRequest(
      mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1'),
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('handles backend error on POST', async () => {
    saveBrandNameMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
        brandName: 'Value'
      }),
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('preserves user input on validation error', async () => {
    getFuelMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
        brandName: '   '
      }),
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'brand-name/index',
      expect.objectContaining({
        formValue: '   '
      })
    )
  })

  test('trims whitespace before saving', async () => {
    saveBrandNameMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleBrandNameDecisionRequest(
      mockRequest('/review-fuel/{fuelId}/brand-name', 'FUEL-1', {
        brandName: '  \t\n  Trimmed Value  \t\n  '
      }),
      h
    )

    expect(saveBrandNameMock).toHaveBeenCalledWith('FUEL-1', 'Trimmed Value')
  })
})
