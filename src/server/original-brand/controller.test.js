import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleOriginalBrandRequest,
  handleOriginalBrandDecisionRequest
} from './controller.js'
import { originalBrand } from './index.js'

const { getFuelForOriginalBrandMock, saveOriginalBrandMock } = vi.hoisted(
  () => ({
    getFuelForOriginalBrandMock: vi.fn(),
    saveOriginalBrandMock: vi.fn()
  })
)

vi.mock('./original-brand-data.js', () => ({
  getFuelForOriginalBrand: getFuelForOriginalBrandMock,
  saveOriginalBrand: saveOriginalBrandMock
}))

const fuel = {
  id: 'FUEL-1',
  name: 'Grillaedin White Quebracho',
  originalFuel: {
    name: 'WHITE QUEBRACHO CHARCOAL (SP51)'
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

describe('#handleOriginalBrandRequest', () => {
  beforeEach(() => {
    getFuelForOriginalBrandMock.mockReset()
    saveOriginalBrandMock.mockReset()
  })

  test('renders the page with the current original fuel name pre-populated', async () => {
    getFuelForOriginalBrandMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleOriginalBrandRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'original-brand/index',
      expect.objectContaining({
        pageTitle: 'Original fuel name or brand',
        formValue: 'WHITE QUEBRACHO CHARCOAL (SP51)'
      })
    )
  })

  test('renders an empty form when no original fuel name is saved', async () => {
    getFuelForOriginalBrandMock.mockResolvedValue({
      data: { ...fuel, originalFuel: { name: null } }
    })
    const h = toolkit()

    await handleOriginalBrandRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'original-brand/index',
      expect.objectContaining({
        formValue: ''
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForOriginalBrandMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleOriginalBrandRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleOriginalBrandDecisionRequest', () => {
  beforeEach(() => {
    getFuelForOriginalBrandMock.mockReset()
    saveOriginalBrandMock.mockReset()
  })

  test('saves the original fuel name and redirects to the fuel details page', async () => {
    saveOriginalBrandMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleOriginalBrandDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          originalName: '  WHITE QUEBRACHO CHARCOAL (SP51)  '
        }
      },
      h
    )

    expect(saveOriginalBrandMock).toHaveBeenCalledWith(
      'FUEL-1',
      'WHITE QUEBRACHO CHARCOAL (SP51)'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when the original fuel name is blank', async () => {
    getFuelForOriginalBrandMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleOriginalBrandDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          originalName: '   '
        }
      },
      h
    )

    expect(saveOriginalBrandMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'original-brand/index',
      expect.objectContaining({
        pageTitle: 'Error: Original fuel name or brand',
        formValue: '   ',
        error: {
          field: 'originalName',
          message: 'Enter original fuel name or brand',
          href: '#original-name'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveOriginalBrandMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleOriginalBrandDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          originalName: 'Updated original fuel name'
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

describe('originalBrand plugin', () => {
  test('registers the GET and POST routes for the original-brand screen', () => {
    const server = {
      route: vi.fn()
    }

    originalBrand.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routes = server.route.mock.calls[0][0]

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'GET',
          path: '/original-brand/{fuelId}'
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/original-brand/{fuelId}'
        })
      ])
    )
  })
})
