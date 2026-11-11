import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelAppearanceRequest,
  handleFuelAppearanceSaveRequest
} from './controller.js'

const { getFuelAppearanceMock, saveFuelAppearanceMock } = vi.hoisted(() => ({
  getFuelAppearanceMock: vi.fn(),
  saveFuelAppearanceMock: vi.fn()
}))

vi.mock('./fuel-appearance-data.js', () => ({
  getFuelAppearance: getFuelAppearanceMock,
  saveFuelAppearance: saveFuelAppearanceMock
}))

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleFuelAppearanceRequest', () => {
  beforeEach(() => {
    getFuelAppearanceMock.mockReset()
    saveFuelAppearanceMock.mockReset()
  })

  test('renders the fuel appearance page with the existing value prefilled', async () => {
    getFuelAppearanceMock.mockResolvedValue({
      data: {
        fuelDescription: {
          appearance: 'Are firelogs that are approx. 220mm in length'
        }
      }
    })
    const h = toolkit()

    await handleFuelAppearanceRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-appearance/index',
      expect.objectContaining({
        formValue: 'Are firelogs that are approx. 220mm in length',
        pageTitle: 'What does the fuel look like?'
      })
    )
  })

  test('prefills empty string when fuelDescription.appearance is absent', async () => {
    getFuelAppearanceMock.mockResolvedValue({ data: { fuelDescription: {} } })
    const h = toolkit()

    await handleFuelAppearanceRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.formValue).toBe('')
  })

  test('fuelDetailsHref and fuelAppearanceAction point to the correct URLs', async () => {
    getFuelAppearanceMock.mockResolvedValue({ data: { fuelDescription: {} } })
    const h = toolkit()

    await handleFuelAppearanceRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelDetailsHref).toBe(
      '/review-fuel/fuel-uuid-1/fuel-details'
    )
    expect(viewModel.fuelAppearanceAction).toBe(
      '/review-fuel/fuel-uuid-1/fuel-appearance'
    )
  })

  test('returns to fuel-description for a rebrand fuel', async () => {
    getFuelAppearanceMock.mockResolvedValue({
      data: { supplierType: 'Rebrand', fuelDescription: null }
    })
    const h = toolkit()

    await handleFuelAppearanceRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelDetailsHref).toBe(
      '/review-fuel/fuel-uuid-1/fuel-description'
    )
    expect(viewModel.formValue).toBe('')
  })

  test('renders error page when the GET fetch fails', async () => {
    getFuelAppearanceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelAppearanceRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleFuelAppearanceSaveRequest', () => {
  beforeEach(() => {
    getFuelAppearanceMock.mockReset()
    getFuelAppearanceMock.mockResolvedValue({
      data: { supplierType: 'Manufacture' }
    })
    saveFuelAppearanceMock.mockReset()
  })

  test('saves and redirects to fuel-description for a rebrand fuel', async () => {
    getFuelAppearanceMock.mockResolvedValue({
      data: { supplierType: 'Rebrand' }
    })
    saveFuelAppearanceMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      { params: { fuelId: 'fuel-uuid-1' }, payload: { appearance: 'Logs' } },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/review-fuel/fuel-uuid-1/fuel-description'
    )
  })

  test('saves and redirects to fuel-details on valid input', async () => {
    saveFuelAppearanceMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      {
        params: { fuelId: 'fuel-uuid-1' },
        payload: { appearance: 'Are firelogs that are approx. 220mm in length' }
      },
      h
    )

    expect(saveFuelAppearanceMock).toHaveBeenCalledWith(
      'fuel-uuid-1',
      'Are firelogs that are approx. 220mm in length'
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-fuel/fuel-uuid-1/fuel-details'
    )
  })

  test('trims whitespace before saving', async () => {
    saveFuelAppearanceMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      {
        params: { fuelId: 'fuel-uuid-1' },
        payload: { appearance: '  Some description  ' }
      },
      h
    )

    expect(saveFuelAppearanceMock).toHaveBeenCalledWith(
      'fuel-uuid-1',
      'Some description'
    )
  })

  test('returns 400 with error message when appearance is empty', async () => {
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      {
        params: { fuelId: 'fuel-uuid-1' },
        payload: { appearance: '' }
      },
      h
    )

    expect(saveFuelAppearanceMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'fuel-appearance/index',
      expect.objectContaining({
        pageTitle: 'Error: What does the fuel look like?',
        error: expect.objectContaining({
          message: 'Enter a description of what the fuel looks like'
        })
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('returns 400 with error message when appearance is whitespace only', async () => {
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      {
        params: { fuelId: 'fuel-uuid-1' },
        payload: { appearance: '   ' }
      },
      h
    )

    expect(saveFuelAppearanceMock).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when the save fails', async () => {
    saveFuelAppearanceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelAppearanceSaveRequest(
      {
        params: { fuelId: 'fuel-uuid-1' },
        payload: { appearance: 'Some description' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
