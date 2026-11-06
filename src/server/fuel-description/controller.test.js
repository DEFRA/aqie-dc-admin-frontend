import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelDescriptionRequest,
  handleFuelDescriptionMarkCompleteRequest
} from './controller.js'

const { getFuelDescriptionMock, saveFuelDescriptionCheckMock } = vi.hoisted(
  () => ({
    getFuelDescriptionMock: vi.fn(),
    saveFuelDescriptionCheckMock: vi.fn()
  })
)

vi.mock('./fuel-description-data.js', () => ({
  getFuelDescription: getFuelDescriptionMock,
  saveFuelDescriptionCheck: saveFuelDescriptionCheckMock
}))

const baseFuel = {
  id: 'fuel-uuid-2',
  applicationId: 'app-uuid-1',
  supplierType: 'Rebrand',
  name: 'Grillaedin White Quebracho',
  originalFuel: {
    manufacturer: 'Josper S.A.U.',
    name: 'WHITE QUEBRACHO CHARCOAL (SP51)',
    isChangedOrMixed: false,
    changes: null
  },
  fuelDescription: {
    appearance: 'Small charcoal pieces',
    weight: '1 kg',
    composition: 'White quebracho wood',
    sulphurContent: 0.05
  },
  manufacturingProcess: 'Traditional charcoal production',
  technicalReview: { listingChecks: { fuelDescription: false } }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleFuelDescriptionRequest', () => {
  beforeEach(() => {
    getFuelDescriptionMock.mockReset()
    saveFuelDescriptionCheckMock.mockReset()
  })

  test('renders the fuel description page with heading from fuel.name', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-description/index',
      expect.objectContaining({
        pageTitle: 'Add fuel description for Grillaedin White Quebracho',
        heading: 'Add fuel description for Grillaedin White Quebracho'
      })
    )
  })

  test('shows 2 original fuel rows with manufacturer and brand name', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.originalFuelRows).toHaveLength(2)
    expect(viewModel.originalFuelRows[0].value.text).toBe('Josper S.A.U.')
    expect(viewModel.originalFuelRows[1].value.text).toBe(
      'WHITE QUEBRACHO CHARCOAL (SP51)'
    )
  })

  test('shows 5 description rows', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.descriptionRows).toHaveLength(5)
  })

  test('description rows show existing values when present', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const valueFor = (label) =>
      viewModel.descriptionRows.find((r) => r.key.text === label).value.text

    expect(valueFor('Fuel appearance')).toBe('Small charcoal pieces')
    expect(valueFor('Fuel weight')).toBe('1 kg')
    expect(valueFor('Fuel composition')).toBe('White quebracho wood')
    expect(valueFor('Sulphur content')).toBe(0.05)
    expect(valueFor('Manufacturing process')).toBe(
      'Traditional charcoal production'
    )
  })

  test('fuelDescriptionAction and cancelHref point to the correct URLs', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelDescriptionAction).toBe(
      '/review-fuel/fuel-uuid-2/fuel-description'
    )
    expect(viewModel.cancelHref).toBe('/review-fuel/fuel-uuid-2')
  })

  test('sets isAlreadyComplete to false when fuelDescription check is not set', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.isAlreadyComplete).toBe(false)
  })

  test('sets isAlreadyComplete to true when fuelDescription check is complete', async () => {
    getFuelDescriptionMock.mockResolvedValue({
      data: {
        ...baseFuel,
        technicalReview: { listingChecks: { fuelDescription: true } }
      }
    })
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.isAlreadyComplete).toBe(true)
  })

  test('renders error page when API fetch fails', async () => {
    getFuelDescriptionMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders 404 when the fuel is not found', async () => {
    const error = new Error('Fuel not found')
    error.status = statusCodes.notFound
    getFuelDescriptionMock.mockRejectedValue(error)
    const h = toolkit()

    await handleFuelDescriptionRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.notFound)
  })
})

describe('#handleFuelDescriptionMarkCompleteRequest', () => {
  beforeEach(() => {
    getFuelDescriptionMock.mockReset()
    saveFuelDescriptionCheckMock.mockReset()
  })

  test('redirects without saving when fuelDescription check is already complete', async () => {
    getFuelDescriptionMock.mockResolvedValue({
      data: {
        ...baseFuel,
        technicalReview: { listingChecks: { fuelDescription: true } }
      }
    })
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDescriptionCheckMock).not.toHaveBeenCalled()
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-2')
  })

  test('re-renders with 400 and all error messages when all fields are missing', async () => {
    getFuelDescriptionMock.mockResolvedValue({
      data: {
        ...baseFuel,
        fuelDescription: {
          appearance: null,
          weight: null,
          composition: null,
          sulphurContent: null
        },
        manufacturingProcess: null
      }
    })
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDescriptionCheckMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'fuel-description/index',
      expect.objectContaining({
        errorSummaryItems: expect.arrayContaining([
          expect.objectContaining({ text: 'Add fuel appearance' }),
          expect.objectContaining({ text: 'Add fuel weight' }),
          expect.objectContaining({ text: 'Add fuel composition' }),
          expect.objectContaining({ text: 'Add sulphur content' }),
          expect.objectContaining({ text: 'Add manufacturing process' })
        ])
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('page title includes Error: prefix when validation fails', async () => {
    getFuelDescriptionMock.mockResolvedValue({
      data: {
        ...baseFuel,
        fuelDescription: { ...baseFuel.fuelDescription, appearance: null }
      }
    })
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.pageTitle).toMatch(/^Error:/)
  })

  test('saves fuelDescription check with all fields and redirects when valid', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    saveFuelDescriptionCheckMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDescriptionCheckMock).toHaveBeenCalledWith('fuel-uuid-2', {
      fuelDescription: {
        appearance: 'Small charcoal pieces',
        weight: '1 kg',
        composition: 'White quebracho wood',
        sulphurContent: 0.05
      },
      manufacturingProcess: 'Traditional charcoal production'
    })
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-2')
  })

  test('renders error page when the save fails', async () => {
    getFuelDescriptionMock.mockResolvedValue({ data: baseFuel })
    saveFuelDescriptionCheckMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the GET fetch fails before save', async () => {
    getFuelDescriptionMock.mockRejectedValue(new Error('not found'))
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDescriptionCheckMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders 404 when the fuel is not found on POST', async () => {
    const error = new Error('Fuel not found')
    error.status = statusCodes.notFound
    getFuelDescriptionMock.mockRejectedValue(error)
    const h = toolkit()

    await handleFuelDescriptionMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDescriptionCheckMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.notFound)
  })
})
