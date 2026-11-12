import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleAdditionalBrandNamesRequest,
  handleAdditionalBrandNamesDecisionRequest
} from './controller.js'

const {
  getFuelForAdditionalBrandNamesMock,
  saveAdditionalBrandNamesMock,
  getAdditionalBrandNamesValuesMock,
  validateAdditionalBrandNamesMock
} = vi.hoisted(() => ({
  getFuelForAdditionalBrandNamesMock: vi.fn(),
  saveAdditionalBrandNamesMock: vi.fn(),
  getAdditionalBrandNamesValuesMock: vi.fn(),
  validateAdditionalBrandNamesMock: vi.fn()
}))

vi.mock('./additional-brand-names-data.js', () => ({
  getFuelForAdditionalBrandNames: getFuelForAdditionalBrandNamesMock,
  saveAdditionalBrandNames: saveAdditionalBrandNamesMock
}))

vi.mock('./validation.js', () => ({
  getAdditionalBrandNamesValues: getAdditionalBrandNamesValuesMock,
  validateAdditionalBrandNames: validateAdditionalBrandNamesMock
}))

const manufacturerFuel = {
  id: 'FUEL-1',
  name: 'Premium Petrol',
  supplierType: 'Manufacturer',
  additionalBrandNames: 'Brand 1, Brand 2',
  technicalReview: {
    status: 'in_review',
    listingChecks: { fuelDetails: null }
  }
}

const rebrandFuel = {
  id: 'FUEL-2',
  name: 'Rebrand Petrol',
  supplierType: 'Rebrand',
  additionalBrandNames: 'Rebrand 1, Rebrand 2',
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

describe('Additional Brand Names: Manufacturer Route', () => {
  beforeEach(() => {
    getFuelForAdditionalBrandNamesMock.mockReset()
    saveAdditionalBrandNamesMock.mockReset()
    getAdditionalBrandNamesValuesMock.mockReset()
    validateAdditionalBrandNamesMock.mockReset()
  })

  test('GET /additional-brand-names renders page with manufacturer wording', async () => {
    getFuelForAdditionalBrandNamesMock.mockResolvedValue({ data: manufacturerFuel })
    getAdditionalBrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Brand 1, Brand 2'
    })
    const h = toolkit()

    await handleAdditionalBrandNamesRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-brand-names/index',
      expect.objectContaining({
        pageTitle: 'Will the fuel be sold under any additional brand names?',
        content: expect.objectContaining({
          heading: 'Will the fuel be sold under any additional brand names?',
          brandsLabel: 'List the additional brand names, separated by commas',
          brandsHint: 'For example Brand 1, Brand 2',
          fieldName: 'additionalBrands',
          fieldId: 'additional-brands'
        }),
        hasAdditionalBrandNames: true,
        additionalBrandNamesValue: 'Brand 1, Brand 2'
      })
    )
  })

  test('POST /additional-brand-names saves and redirects (Manufacturer)', async () => {
    validateAdditionalBrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: '  Brand 1, Brand 2  '
      },
      errors: {},
      errorList: []
    })
    saveAdditionalBrandNamesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalBrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: '  Brand 1, Brand 2  '
        }
      },
      h
    )

    expect(saveAdditionalBrandNamesMock).toHaveBeenCalledWith(
      'FUEL-1',
      'Brand 1, Brand 2'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })
})

describe('Additional Brand Names: Rebrand Route', () => {
  beforeEach(() => {
    getFuelForAdditionalBrandNamesMock.mockReset()
    saveAdditionalBrandNamesMock.mockReset()
    getAdditionalBrandNamesValuesMock.mockReset()
    validateAdditionalBrandNamesMock.mockReset()
  })

  test('GET /additional-rebrand-names renders page with rebrand wording', async () => {
    getFuelForAdditionalBrandNamesMock.mockResolvedValue({ data: rebrandFuel })
    getAdditionalBrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
    const h = toolkit()

    await handleAdditionalBrandNamesRequest(
      {
        params: { fuelId: 'FUEL-2' },
        route: { path: '/review-fuel/{fuelId}/additional-rebrand-names' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-brand-names/index',
      expect.objectContaining({
        pageTitle: 'Will the fuel be sold under any additional rebrand names?',
        content: expect.objectContaining({
          heading: 'Will the fuel be sold under any additional rebrand names?',
          brandsLabel: 'List the additional rebrand names, separated by commas',
          brandsHint: 'For example Rebrand 1, Rebrand 2',
          fieldName: 'additionalRebrandBrands',
          fieldId: 'additional-rebrand-brands'
        }),
        hasAdditionalBrandNames: true,
        additionalBrandNamesValue: 'Rebrand 1, Rebrand 2'
      })
    )
  })

  test('POST /additional-rebrand-names saves and redirects (Rebrand)', async () => {
    validateAdditionalBrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: '  Rebrand 1, Rebrand 2  '
      },
      errors: {},
      errorList: []
    })
    saveAdditionalBrandNamesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalBrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-2' },
        route: { path: '/review-fuel/{fuelId}/additional-rebrand-names' },
        payload: {
          addBrands: 'Yes',
          additionalRebrandBrands: '  Rebrand 1, Rebrand 2  '
        }
      },
      h
    )

    expect(saveAdditionalBrandNamesMock).toHaveBeenCalledWith(
      'FUEL-2',
      'Rebrand 1, Rebrand 2'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-2/fuel-details')
  })
})

describe('Additional Brand Names: Shared Behavior', () => {
  beforeEach(() => {
    getFuelForAdditionalBrandNamesMock.mockReset()
    saveAdditionalBrandNamesMock.mockReset()
    getAdditionalBrandNamesValuesMock.mockReset()
    validateAdditionalBrandNamesMock.mockReset()
  })

  test('renders with no selection when there are no saved brand names', async () => {
    getFuelForAdditionalBrandNamesMock.mockResolvedValue({
      data: { ...manufacturerFuel, additionalBrandNames: '' }
    })
    getAdditionalBrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: false,
      additionalBrandNames: ''
    })
    const h = toolkit()

    await handleAdditionalBrandNamesRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-brand-names/index',
      expect.objectContaining({
        hasAdditionalBrandNames: false,
        additionalBrandNamesValue: ''
      })
    )
  })

  test('saves null value when No is selected', async () => {
    validateAdditionalBrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: false,
        additionalBrandNames: '   '
      },
      errors: {},
      errorList: []
    })
    saveAdditionalBrandNamesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalBrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' },
        payload: {
          addBrands: 'No',
          additionalBrands: '   '
        }
      },
      h
    )

    expect(saveAdditionalBrandNamesMock).toHaveBeenCalledWith('FUEL-1', null)
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('renders with validation error when Yes is selected but names are blank', async () => {
    getFuelForAdditionalBrandNamesMock.mockResolvedValue({ data: manufacturerFuel })
    validateAdditionalBrandNamesMock.mockReturnValue({
      isValid: false,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: '   '
      },
      errors: {
        additionalBrands:
          'Enter any additional brand names the fuel will be sold under, separated by commas'
      },
      errorList: [
        {
          field: 'additionalBrands',
          message:
            'Enter any additional brand names the fuel will be sold under, separated by commas',
          href: '#additional-brands'
        }
      ]
    })
    const h = toolkit()

    await handleAdditionalBrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: '   '
        }
      },
      h
    )

    expect(saveAdditionalBrandNamesMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'additional-brand-names/index',
      expect.objectContaining({
        pageTitle:
          'Error: Will the fuel be sold under any additional brand names?',
        hasAdditionalBrandNames: true,
        additionalBrandNamesValue: '   ',
        error: expect.objectContaining({
          field: 'additionalBrands',
          message: expect.any(String)
        })
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForAdditionalBrandNamesMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleAdditionalBrandNamesRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when save fails', async () => {
    validateAdditionalBrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: 'Updated brand'
      },
      errors: {},
      errorList: []
    })
    saveAdditionalBrandNamesMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleAdditionalBrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: 'Updated brand'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('sets cancel link back to fuel details page', async () => {
    getFuelForAdditionalBrandNamesMock.mockResolvedValue({ data: manufacturerFuel })
    getAdditionalBrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Brand 1, Brand 2'
    })
    const h = toolkit()

    await handleAdditionalBrandNamesRequest(
      {
        params: { fuelId: 'FUEL-1' },
        route: { path: '/review-fuel/{fuelId}/additional-brand-names' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-brand-names/index',
      expect.objectContaining({
        fuelDetailsHref: '/review-fuel/FUEL-1/fuel-details'
      })
    )
  })
})
