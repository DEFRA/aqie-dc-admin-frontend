import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleAdditionalRebrandNamesRequest,
  handleAdditionalRebrandNamesDecisionRequest
} from './controller.js'

const {
  getFuelForAdditionalRebrandNamesMock,
  saveAdditionalRebrandNamesMock,
  getAdditionalRebrandNamesValuesMock,
  validateAdditionalRebrandNamesMock
} = vi.hoisted(() => ({
  getFuelForAdditionalRebrandNamesMock: vi.fn(),
  saveAdditionalRebrandNamesMock: vi.fn(),
  getAdditionalRebrandNamesValuesMock: vi.fn(),
  validateAdditionalRebrandNamesMock: vi.fn()
}))

vi.mock('./additional-rebrand-names-data.js', () => ({
  getFuelForAdditionalRebrandNames: getFuelForAdditionalRebrandNamesMock,
  saveAdditionalRebrandNames: saveAdditionalRebrandNamesMock
}))

vi.mock('./validation.js', () => ({
  getAdditionalRebrandNamesValues: getAdditionalRebrandNamesValuesMock,
  validateAdditionalRebrandNames: validateAdditionalRebrandNamesMock,
  normaliseAdditionalBrandNamesValue: vi.fn((value) =>
    Array.isArray(value) ? value.join(', ') : (value ?? '')
  )
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Grillaedin White Quebracho',
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

describe('#handleAdditionalRebrandNamesRequest', () => {
  beforeEach(() => {
    getFuelForAdditionalRebrandNamesMock.mockReset()
    saveAdditionalRebrandNamesMock.mockReset()
    getAdditionalRebrandNamesValuesMock.mockReset()
    validateAdditionalRebrandNamesMock.mockReset()
  })

  test('renders the page with the current additional rebrand names pre-populated', async () => {
    getFuelForAdditionalRebrandNamesMock.mockResolvedValue({ data: fuel })
    getAdditionalRebrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
    const h = toolkit()

    await handleAdditionalRebrandNamesRequest(
      { params: { fuelId: 'FUEL-1' } },
      h
    )

    expect(getAdditionalRebrandNamesValuesMock).toHaveBeenCalledWith(fuel)
    expect(h.view).toHaveBeenCalledWith(
      'additional-rebrand-names/index',
      expect.objectContaining({
        pageTitle: 'Will the fuel be sold under any additional rebrand names?',
        hasAdditionalBrandNames: true,
        additionalBrandNamesValue: 'Rebrand 1, Rebrand 2'
      })
    )
  })

  test('renders the page with no selection when there are no saved additional rebrand names', async () => {
    getFuelForAdditionalRebrandNamesMock.mockResolvedValue({
      data: { ...fuel, additionalBrandNames: [] }
    })
    getAdditionalRebrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: false,
      additionalBrandNames: ''
    })
    const h = toolkit()

    await handleAdditionalRebrandNamesRequest(
      { params: { fuelId: 'FUEL-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-rebrand-names/index',
      expect.objectContaining({
        hasAdditionalBrandNames: false,
        additionalBrandNamesValue: ''
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForAdditionalRebrandNamesMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleAdditionalRebrandNamesRequest(
      { params: { fuelId: 'FUEL-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleAdditionalRebrandNamesDecisionRequest', () => {
  beforeEach(() => {
    getFuelForAdditionalRebrandNamesMock.mockReset()
    saveAdditionalRebrandNamesMock.mockReset()
    getAdditionalRebrandNamesValuesMock.mockReset()
    validateAdditionalRebrandNamesMock.mockReset()
  })

  test('saves the additional rebrand names and redirects to fuel details when Yes is selected', async () => {
    validateAdditionalRebrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: '  Rebrand 1, Rebrand 2  '
      },
      errors: {},
      errorList: []
    })
    saveAdditionalRebrandNamesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalRebrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: '  Rebrand 1, Rebrand 2  '
        }
      },
      h
    )

    expect(validateAdditionalRebrandNamesMock).toHaveBeenCalledWith({
      addBrands: 'Yes',
      additionalBrands: '  Rebrand 1, Rebrand 2  '
    })
    expect(saveAdditionalRebrandNamesMock).toHaveBeenCalledWith(
      'FUEL-1',
      'Rebrand 1, Rebrand 2'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('saves a null value and redirects when No is selected', async () => {
    validateAdditionalRebrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: false,
        additionalBrandNames: '   '
      },
      errors: {},
      errorList: []
    })
    saveAdditionalRebrandNamesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleAdditionalRebrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          addBrands: 'No',
          additionalBrands: '   '
        }
      },
      h
    )

    expect(saveAdditionalRebrandNamesMock).toHaveBeenCalledWith('FUEL-1', null)
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when Yes is selected but no rebrand names are entered', async () => {
    getFuelForAdditionalRebrandNamesMock.mockResolvedValue({ data: fuel })
    validateAdditionalRebrandNamesMock.mockReturnValue({
      isValid: false,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: '   '
      },
      errors: {
        additionalBrands:
          'Enter any additional rebrand names the fuel will be sold under, separated by commas'
      },
      errorList: [
        {
          field: 'additionalBrands',
          message:
            'Enter any additional rebrand names the fuel will be sold under, separated by commas',
          href: '#additional-brands'
        }
      ]
    })
    const h = toolkit()

    await handleAdditionalRebrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: '   '
        }
      },
      h
    )

    expect(saveAdditionalRebrandNamesMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'additional-rebrand-names/index',
      expect.objectContaining({
        pageTitle:
          'Error: Will the fuel be sold under any additional rebrand names?',
        hasAdditionalBrandNames: true,
        additionalBrandNamesValue: '   ',
        error: {
          field: 'additionalBrands',
          message:
            'Enter any additional rebrand names the fuel will be sold under, separated by commas',
          href: '#additional-brands'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('sets the cancel link back to the fuel details page', async () => {
    getFuelForAdditionalRebrandNamesMock.mockResolvedValue({ data: fuel })
    getAdditionalRebrandNamesValuesMock.mockReturnValue({
      hasAdditionalBrandNames: true,
      additionalBrandNames: 'Rebrand 1, Rebrand 2'
    })
    const h = toolkit()

    await handleAdditionalRebrandNamesRequest(
      { params: { fuelId: 'FUEL-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'additional-rebrand-names/index',
      expect.objectContaining({
        fuelDetailsHref: '/review-fuel/FUEL-1/fuel-details'
      })
    )
  })

  test('renders error page when save fails', async () => {
    validateAdditionalRebrandNamesMock.mockReturnValue({
      isValid: true,
      values: {
        hasAdditionalBrandNames: true,
        additionalBrandNames: 'Updated rebrand name'
      },
      errors: {},
      errorList: []
    })
    saveAdditionalRebrandNamesMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleAdditionalRebrandNamesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          addBrands: 'Yes',
          additionalBrands: 'Updated rebrand name'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
