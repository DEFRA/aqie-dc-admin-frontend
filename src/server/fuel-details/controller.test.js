import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelDetailsRequest,
  handleFuelDetailsMarkCompleteRequest
} from './controller.js'

const { getFuelDetailsMock, saveFuelDetailsCheckMock } = vi.hoisted(() => ({
  getFuelDetailsMock: vi.fn(),
  saveFuelDetailsCheckMock: vi.fn()
}))

vi.mock('./fuel-details-data.js', () => ({
  getFuelDetails: getFuelDetailsMock,
  saveFuelDetailsCheck: saveFuelDetailsCheckMock
}))

const baseFuel = {
  id: 'fuel-uuid-1',
  applicationId: 'app-uuid-1',
  supplierType: 'Manufacture',
  brandName: 'Kings Starterlog',
  additionalBrandNames: [],
  fuelDescription: {
    appearance: 'Are firelogs that are approx. 220mm in length',
    weight: 'Has an average weight of approx. 600 grams',
    composition: 'Comprises of slack wax',
    sulphurContent: 0.1
  },
  manufacturingProcess: 'Was manufactured by heat treatment',
  hasQualityControlSystem: true
}

const baseResellerFuel = {
  id: 'fuel-uuid-2',
  applicationId: 'app-uuid-1',
  supplierType: 'Rebrand',
  brandName: 'Grillaedin White Quebracho',
  additionalBrandNames: [],
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
  manufacturingProcess: 'Traditional charcoal production'
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleFuelDetailsRequest', () => {
  beforeEach(() => {
    getFuelDetailsMock.mockReset()
    saveFuelDetailsCheckMock.mockReset()
  })

  test('renders the fuel details page with heading and title from fuel.brandName', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-details/index',
      expect.objectContaining({
        pageTitle: 'Check fuel details for Kings Starterlog',
        heading: 'Check fuel details for Kings Starterlog'
      })
    )
  })

  test('builds 8 summary rows for a manufacturer when additionalBrandNames is empty', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(8)
  })

  test('builds 9 summary rows for a manufacturer when additionalBrandNames is non-empty', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseFuel,
        additionalBrandNames: ['Brandname 1', 'BrandNAME two']
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(9)
  })

  test('reads fuelDescription fields from nested fuelDescription object', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const valueFor = (label) =>
      viewModel.summaryRows.find((r) => r.key.text === label).value.text

    expect(valueFor('Fuel appearance')).toBe(
      'Are firelogs that are approx. 220mm in length'
    )
    expect(valueFor('Fuel weight')).toBe(
      'Has an average weight of approx. 600 grams'
    )
    expect(valueFor('Fuel composition')).toBe('Comprises of slack wax')
    expect(valueFor('Sulphur content')).toBe('0.1')
  })

  test('reads hasQualityControlSystem for manufacturer rows', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Monitored quality control system'
    )
    expect(row.value.text).toBe('Yes')
  })

  test('fuelDetailsAction and cancelHref point to the review-fuel page', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelDetailsAction).toBe(
      '/review-fuel/fuel-uuid-1/fuel-details'
    )
    expect(viewModel.cancelHref).toBe('/review-fuel/fuel-uuid-1')
  })

  test('uses "Not provided" as the heading when brandName is absent', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: { ...baseFuel, brandName: undefined }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-details/index',
      expect.objectContaining({
        heading: 'Check fuel details for Not provided'
      })
    )
  })

  test('renders error page when API fetch fails', async () => {
    getFuelDetailsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  describe('reseller journey', () => {
    test('uses fuel.brandName in the heading for a rebrand fuel', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      expect(h.view).toHaveBeenCalledWith(
        'fuel-details/index',
        expect.objectContaining({
          heading: 'Check fuel details for Grillaedin White Quebracho'
        })
      )
    })

    test('builds 5 summary rows for a rebrand when additionalBrandNames is empty and isChangedOrMixed is false', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(5)
    })

    test('builds 6 summary rows for a rebrand when isChangedOrMixed is true', async () => {
      getFuelDetailsMock.mockResolvedValue({
        data: {
          ...baseResellerFuel,
          originalFuel: {
            ...baseResellerFuel.originalFuel,
            isChangedOrMixed: true,
            changes: 'Made pieces smaller'
          }
        }
      })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(6)
    })

    test('shows originalFuel fields for a rebrand', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      const valueFor = (label) =>
        viewModel.summaryRows.find((r) => r.key.text === label).value.text

      expect(valueFor('Original fuel manufacturer')).toBe('Josper S.A.U.')
      expect(valueFor('Original fuel name or brand')).toBe(
        'WHITE QUEBRACHO CHARCOAL (SP51)'
      )
      expect(valueFor('Changes made to original fuel')).toBe('No')
    })

    test('shows changes detail row when isChangedOrMixed is true', async () => {
      getFuelDetailsMock.mockResolvedValue({
        data: {
          ...baseResellerFuel,
          originalFuel: {
            ...baseResellerFuel.originalFuel,
            isChangedOrMixed: true,
            changes: 'Made pieces smaller'
          }
        }
      })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Detail of changes'
      )
      expect(row.value.text).toBe('Made pieces smaller')
    })

    test('omits changes detail row when isChangedOrMixed is false', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Detail of changes'
      )
      expect(row).toBeUndefined()
    })

    test('omits hasQualityControlSystem row for rebrand', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(
        viewModel.summaryRows.find(
          (r) => r.key.text === 'Monitored quality control system'
        )
      ).toBeUndefined()
    })
  })
})

describe('#handleFuelDetailsMarkCompleteRequest', () => {
  beforeEach(() => {
    getFuelDetailsMock.mockReset()
    saveFuelDetailsCheckMock.mockReset()
  })

  test('calls one PATCH with check fuelDetails for a manufacturer and redirects', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    saveFuelDetailsCheckMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    expect(saveFuelDetailsCheckMock).toHaveBeenCalledTimes(1)
    expect(saveFuelDetailsCheckMock).toHaveBeenCalledWith(
      'fuel-uuid-1',
      'fuelDetails'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-1')
  })

  test('calls two PATCHes for a rebrand — fuelDetails then fuelDescription — and redirects', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
    saveFuelDetailsCheckMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(saveFuelDetailsCheckMock).toHaveBeenCalledTimes(2)
    expect(saveFuelDetailsCheckMock).toHaveBeenNthCalledWith(
      1,
      'fuel-uuid-2',
      'fuelDetails'
    )
    expect(saveFuelDetailsCheckMock).toHaveBeenNthCalledWith(
      2,
      'fuel-uuid-2',
      'fuelDescription'
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-2')
  })

  test('does not send fuelDescription PATCH for a manufacturer', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    saveFuelDetailsCheckMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    const checkNames = saveFuelDetailsCheckMock.mock.calls.map(
      ([, check]) => check
    )
    expect(checkNames).not.toContain('fuelDescription')
  })

  test('renders error page when the save fails', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    saveFuelDetailsCheckMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the GET fetch fails before save', async () => {
    getFuelDetailsMock.mockRejectedValue(new Error('not found'))
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    expect(saveFuelDetailsCheckMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
