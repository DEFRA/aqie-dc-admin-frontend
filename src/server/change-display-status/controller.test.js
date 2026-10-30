/**
 * Regression tests for the visibility confirmation page and save flow.
 *
 * These tests cover the GET screen rendering and the POST boolean update that returns
 * the user to the appliance record page without exposing any business logic on the client.
 */
import { describe, expect, test, vi } from 'vitest'
import {
  handleGetChangeDisplayStatusPage,
  handlePostChangeDisplayStatusPage
} from './controller.js'
import {
  getApplianceVisibilityState,
  saveApplianceVisibility
} from './change-display-status-data.js'
import { changeDisplayStatus } from './index.js'

vi.mock('./change-display-status-data.js', () => ({
  getApplianceVisibilityState: vi.fn(),
  saveApplianceVisibility: vi.fn()
}))

const reviewer = { name: 'A Reviewer', email: 'a@defra.gov.uk', id: 'x' }

describe('change display status controller', () => {
  test('registers the GET and POST appliance record visibility routes', () => {
    const server = { route: vi.fn() }

    changeDisplayStatus.plugin.register(server)

    expect(server.route).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'GET',
          path: '/appliance-record/{applianceId}/change-display-status'
        }),
        expect.objectContaining({
          method: 'POST',
          path: '/appliance-record/{applianceId}/change-display-status'
        })
      ])
    )
  })

  test('fetches the current public visibility state and renders the hide screen', async () => {
    getApplianceVisibilityState.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        isVisibleToPublic: true
      }
    })

    const h = {
      view: (template, context) => ({ template, context })
    }

    const result = await handleGetChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' } },
      h
    )

    expect(getApplianceVisibilityState).toHaveBeenCalledWith('APP-123')
    expect(result.template).toBe('change-display-status/index')
    expect(result.context.heading).toBe(
      'Hide Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove from public list'
    )
    expect(result.context.question).toBe(
      'Should this appliance be hidden from the public list?'
    )
    expect(result.context.visibilityItems).toEqual([
      { value: 'false', text: 'Yes' },
      { value: 'true', text: 'No' }
    ])
    expect(result.context.formAction).toBe(
      '/appliance-record/APP-123/change-display-status'
    )
    expect(result.context.cancelHref).toBe('/appliance-record/APP-123')
  })

  test('uses the route appliance id on GET', async () => {
    getApplianceVisibilityState.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Route appliance',
        isVisibleToPublic: true
      }
    })

    const h = {
      view: (template, context) => ({ template, context })
    }

    const result = await handleGetChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' } },
      h
    )

    expect(getApplianceVisibilityState).toHaveBeenCalledWith('APP-123')
    expect(result.context.heading).toBe('Hide Route appliance from public list')
  })

  test('uses a default model name when the backend returns no payload data', async () => {
    getApplianceVisibilityState.mockResolvedValue(undefined)

    const h = {
      view: (template, context) => ({ template, context })
    }

    const result = await handleGetChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' } },
      h
    )

    expect(result.context.heading).toBe('Make appliance live on public list')
    expect(result.context.description).toBe(
      'This appliance is currently hidden from the public list.'
    )
  })

  test('renders the generic error page when GET fails', async () => {
    getApplianceVisibilityState.mockRejectedValue(new Error('backend down'))

    const h = {
      view: vi.fn().mockReturnValue({
        code: vi.fn().mockReturnThis()
      })
    }

    await handleGetChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })

  test('renders the make public screen when the appliance is hidden', async () => {
    getApplianceVisibilityState.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        isVisibleToPublic: false
      }
    })

    const h = {
      view: (template, context) => ({ template, context })
    }

    const result = await handleGetChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' } },
      h
    )

    expect(result.context.heading).toBe(
      'Make Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove live on public list'
    )
    expect(result.context.question).toBe(
      'Should this appliance be made live on the public list?'
    )
    expect(result.context.visibilityItems).toEqual([
      { value: 'true', text: 'Yes' },
      { value: 'false', text: 'No' }
    ])
  })

  test('validates the payload on the POST route without a failAction', () => {
    const server = { route: vi.fn() }

    changeDisplayStatus.plugin.register(server)

    const postRoute = server.route.mock.calls[0][0].find(
      (route) => route.method === 'POST'
    )
    const { payload } = postRoute.options.validate

    expect(postRoute.options.validate.params).toBeDefined()
    expect(postRoute.options.validate.failAction).toBeUndefined()
    expect(payload.validate({}).error).toBeUndefined()
    expect(payload.validate({ isVisibleToPublic: 'maybe' }).error).toBeDefined()
  })

  test('re-renders the page with a validation error when no radio option is selected', async () => {
    getApplianceVisibilityState.mockResolvedValue({
      success: true,
      data: {
        id: 'APP-123',
        modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        isVisibleToPublic: true
      }
    })

    const code = vi.fn().mockReturnThis()
    const h = {
      view: vi.fn().mockReturnValue({ code })
    }

    await handlePostChangeDisplayStatusPage(
      { params: { applianceId: 'APP-123' }, payload: {} },
      h
    )

    expect(code).toHaveBeenCalledWith(400)
    expect(h.view).toHaveBeenCalledWith(
      'change-display-status/index',
      expect.objectContaining({
        error: expect.objectContaining({
          field: 'isVisibleToPublic',
          message:
            'Select yes if you want this appliance to be hidden from the public list'
        })
      })
    )
  })

  test('saves the exact boolean visibility state selected by the user', async () => {
    saveApplianceVisibility.mockResolvedValue({ success: true })

    const h = {
      redirect: vi.fn().mockReturnThis()
    }

    await handlePostChangeDisplayStatusPage(
      {
        params: { applianceId: 'APP-123' },
        payload: {
          isVisibleToPublic: 'false'
        },
        auth: { credentials: { user: reviewer } }
      },
      h
    )

    expect(saveApplianceVisibility).toHaveBeenCalledWith(
      'APP-123',
      false,
      { name: reviewer.name, email: reviewer.email }
    )
    expect(h.redirect).toHaveBeenCalledWith('/appliance-record/APP-123')
  })

  test('passes the signed-in user as reviewedBy', async () => {
    saveApplianceVisibility.mockResolvedValue({ success: true })
    const h = { redirect: vi.fn().mockReturnThis() }

    await handlePostChangeDisplayStatusPage(
      {
        params: { applianceId: 'APP-123' },
        payload: { isVisibleToPublic: 'true' },
        auth: {
          credentials: {
            user: { name: 'A Reviewer', email: 'a@defra.gov.uk', id: 'x' }
          }
        }
      },
      h
    )

    expect(saveApplianceVisibility).toHaveBeenCalledWith('APP-123', true, {
      name: 'A Reviewer',
      email: 'a@defra.gov.uk'
    })
  })

  test('falls back to an unknown reviewer when no user is signed in', async () => {
    saveApplianceVisibility.mockResolvedValue({ success: true })
    const h = { redirect: vi.fn().mockReturnThis() }

    await handlePostChangeDisplayStatusPage(
      {
        params: { applianceId: 'APP-123' },
        payload: { isVisibleToPublic: 'true' }
      },
      h
    )

    expect(saveApplianceVisibility).toHaveBeenCalledWith('APP-123', true, {
      name: 'Unknown reviewer',
      email: 'unknown-reviewer@unknown.gov.uk'
    })
  })

  test('uses the route appliance id on POST', async () => {
    saveApplianceVisibility.mockResolvedValue({ success: true })

    const h = {
      redirect: vi.fn().mockReturnValue('redirected')
    }

    const result = await handlePostChangeDisplayStatusPage(
      {
        params: { applianceId: 'APP-123' },
        payload: {
          isVisibleToPublic: 'true'
        },
        auth: { credentials: { user: reviewer } }
      },
      h
    )

    expect(saveApplianceVisibility).toHaveBeenCalledWith('APP-123', true, {
      name: reviewer.name,
      email: reviewer.email
    })
    expect(h.redirect).toHaveBeenCalledWith('/appliance-record/APP-123')
    expect(result).toBe('redirected')
  })

  test('renders the generic error page when POST fails', async () => {
    saveApplianceVisibility.mockRejectedValue(new Error('backend down'))

    const h = {
      view: vi.fn().mockReturnValue({
        code: vi.fn().mockReturnThis()
      })
    }

    await handlePostChangeDisplayStatusPage(
      {
        params: { applianceId: 'APP-123' },
        payload: {
          isVisibleToPublic: 'true'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })
})
