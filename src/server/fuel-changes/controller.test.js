import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelChangesRequest,
  handleFuelChangesDecisionRequest
} from './controller.js'
import { fuelChanges } from './index.js'

const { getFuelForFuelChangesMock, saveFuelChangesMock } = vi.hoisted(() => ({
  getFuelForFuelChangesMock: vi.fn(),
  saveFuelChangesMock: vi.fn()
}))

vi.mock('./fuel-changes-data.js', () => ({
  getFuelForFuelChanges: getFuelForFuelChangesMock,
  saveFuelChanges: saveFuelChangesMock
}))

const fuel = {
  id: 'FUEL-1',
  originalFuel: {
    isChangedOrMixed: true,
    changes: 'Mixed with another fuel'
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

describe('#handleFuelChangesRequest', () => {
  beforeEach(() => {
    getFuelForFuelChangesMock.mockReset()
    saveFuelChangesMock.mockReset()
  })

  test('renders the page with the current change details pre-populated', async () => {
    getFuelForFuelChangesMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleFuelChangesRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-changes/index',
      expect.objectContaining({
        pageTitle: 'Changes made to original fuel?',
        hasFuelChanges: true,
        changesValue: 'Mixed with another fuel'
      })
    )
  })

  test('renders an empty form when no change details are saved', async () => {
    getFuelForFuelChangesMock.mockResolvedValue({
      data: {
        ...fuel,
        originalFuel: { isChangedOrMixed: false, changes: null }
      }
    })
    const h = toolkit()

    await handleFuelChangesRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-changes/index',
      expect.objectContaining({
        hasFuelChanges: false,
        changesValue: ''
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getFuelForFuelChangesMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelChangesRequest({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleFuelChangesDecisionRequest', () => {
  beforeEach(() => {
    getFuelForFuelChangesMock.mockReset()
    saveFuelChangesMock.mockReset()
  })

  test('saves the change details and redirects to the fuel details page', async () => {
    saveFuelChangesMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleFuelChangesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          isChangedOrMixed: 'Yes',
          changes: '  Adjusted and mixed with another fuel  '
        }
      },
      h
    )

    expect(saveFuelChangesMock).toHaveBeenCalledWith(
      'FUEL-1',
      true,
      'Adjusted and mixed with another fuel'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1/fuel-details')
  })

  test('re-renders with validation error when the fuel has been altered but no details are provided', async () => {
    getFuelForFuelChangesMock.mockResolvedValue({ data: fuel })
    const h = toolkit()

    await handleFuelChangesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          isChangedOrMixed: 'Yes',
          changes: '   '
        }
      },
      h
    )

    expect(saveFuelChangesMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'fuel-changes/index',
      expect.objectContaining({
        pageTitle: 'Error: Changes made to original fuel?',
        hasFuelChanges: true,
        changesValue: '   ',
        error: {
          field: 'changes',
          message:
            'Enter details of how the fuel has been altered or mixed with another fuel',
          href: '#changes'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveFuelChangesMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelChangesDecisionRequest(
      {
        params: { fuelId: 'FUEL-1' },
        payload: {
          isChangedOrMixed: 'No',
          changes: ''
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

describe('fuelChanges plugin', () => {
  test('registers the GET and POST routes for the fuel-changes screen', () => {
    const server = {
      route: vi.fn()
    }

    fuelChanges.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routes = server.route.mock.calls[0][0]

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'GET',
          path: '/fuel-changes/{fuelId}'
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/fuel-changes/{fuelId}'
        })
      ])
    )
  })
})
