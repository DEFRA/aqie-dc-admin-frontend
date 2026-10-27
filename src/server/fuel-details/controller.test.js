import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleFuelDetailsRequest } from './controller.js'

const { getFuelDetailsMock } = vi.hoisted(() => ({
  getFuelDetailsMock: vi.fn()
}))

vi.mock('./fuel-details-data.js', () => ({
  getFuelDetails: getFuelDetailsMock
}))

const baseFuel = {
  id: 'fuel-uuid-1',
  applicationId: 'app-uuid-1',
  manufacturerOrReseller: 'manufacturer',
  brandName: 'Kings Starterlog',
  additionalBrandNames: false,
  fuelAppearance: 'Are firelogs that are approx. 220mm in length',
  fuelWeight: 'Has an average weight of approx. 600 grams',
  fuelComposition: 'Comprises of slack wax',
  sulphurContent: '0.1 % of total dry weight',
  manufacturingProcess: 'Was manufactured by heat treatment',
  monitoredQualityControlSystem: true
}

const baseResellerFuel = {
  id: 'fuel-uuid-2',
  applicationId: 'app-uuid-1',
  manufacturerOrReseller: 'reseller',
  rebrandedName: 'Grillaedin White Quebracho',
  additionalRebrandNames: false,
  originalFuelManufacturer: 'Josper S.A.U.',
  originalFuelNameOrBrand: 'WHITE QUEBRACHO CHARCOAL (SP51)',
  changesMadeToOriginalFuel: false
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleFuelDetailsRequest', () => {
  beforeEach(() => {
    getFuelDetailsMock.mockReset()
  })

  test('renders the fuel details page with heading and title', async () => {
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

  test('builds 8 summary rows when additionalBrandNames is false', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(8)
  })

  test('builds 9 summary rows when additionalBrandNames is true', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseFuel,
        additionalBrandNames: true,
        additionalBrandNamesList: ['Brandname 1', 'BrandNAME two']
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(9)
  })

  test('joins additionalBrandNamesList as comma-separated string', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseFuel,
        additionalBrandNames: true,
        additionalBrandNamesList: ['Brandname 1', 'BrandNAME two']
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Additional brand name(s)'
    )
    expect(row.value.text).toBe('Brandname 1, BrandNAME two')
  })

  test('omits additional brand names row when additionalBrandNames is false', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Additional brand name(s)'
    )
    expect(row).toBeUndefined()
  })

  test('renders "Yes" for boolean true values', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Monitored quality control system'
    )
    expect(row.value.text).toBe('Yes')
  })

  test('renders "No" for boolean false values', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) =>
        r.key.text === 'Will the fuel be sold under any additional brand names?'
    )
    expect(row.value.text).toBe('No')
  })

  test('renders "Not provided" for undefined fields', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: { ...baseFuel, fuelAppearance: undefined }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Fuel appearance'
    )
    expect(row.value.text).toBe('Not provided')
  })

  test('each row has a Change action with a href and visuallyHiddenText', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    for (const row of viewModel.summaryRows) {
      expect(row.actions.items[0].text).toBe('Change')
      expect(row.actions.items[0].href).toBeTruthy()
      expect(row.actions.items[0].visuallyHiddenText).toBeTruthy()
    }
  })

  test('markAsCompletedHref and cancelHref point to the review page when applicationId is present', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.markAsCompletedHref).toBe(
      '/review-fuel-application/app-uuid-1'
    )
    expect(viewModel.cancelHref).toBe('/review-fuel-application/app-uuid-1')
  })

  test('falls back to /fuel-applications when applicationId is absent', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: { ...baseFuel, applicationId: undefined }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.markAsCompletedHref).toBe('/fuel-applications')
    expect(viewModel.cancelHref).toBe('/fuel-applications')
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

  describe('reseller journey', () => {
    test('uses rebrandedName in the heading', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      expect(h.view).toHaveBeenCalledWith(
        'fuel-details/index',
        expect.objectContaining({
          pageTitle: 'Check fuel details for Grillaedin White Quebracho',
          heading: 'Check fuel details for Grillaedin White Quebracho'
        })
      )
    })

    test('builds 5 summary rows when additionalRebrandNames and changesMadeToOriginalFuel are both false', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(5)
    })

    test('shows additionalRebrandNames row when additionalRebrandNames is true', async () => {
      getFuelDetailsMock.mockResolvedValue({
        data: {
          ...baseResellerFuel,
          additionalRebrandNames: true,
          additionalRebrandNamesList: ['brand 1', 'brand 2', 'brand 3']
        }
      })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(6)
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Additional rebrand name(s)'
      )
      expect(row.value.text).toBe('brand 1, brand 2, brand 3')
    })

    test('omits additionalRebrandNames row when additionalRebrandNames is false', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Additional rebrand name(s)'
      )
      expect(row).toBeUndefined()
    })

    test('shows detailOfChanges row when changesMadeToOriginalFuel is true', async () => {
      getFuelDetailsMock.mockResolvedValue({
        data: {
          ...baseResellerFuel,
          changesMadeToOriginalFuel: true,
          detailOfChanges: 'Made pieces smaller'
        }
      })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(6)
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Detail of changes'
      )
      expect(row.value.text).toBe('Made pieces smaller')
    })

    test('omits detailOfChanges row when changesMadeToOriginalFuel is false', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      const row = viewModel.summaryRows.find(
        (r) => r.key.text === 'Detail of changes'
      )
      expect(row).toBeUndefined()
    })

    test('each reseller row has a Change action with a href and visuallyHiddenText', async () => {
      getFuelDetailsMock.mockResolvedValue({ data: baseResellerFuel })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      const [, viewModel] = h.view.mock.calls[0]
      for (const row of viewModel.summaryRows) {
        expect(row.actions.items[0].text).toBe('Change')
        expect(row.actions.items[0].href).toBeTruthy()
        expect(row.actions.items[0].visuallyHiddenText).toBeTruthy()
      }
    })

    test('uses "Not provided" as heading when rebrandedName is absent', async () => {
      getFuelDetailsMock.mockResolvedValue({
        data: { ...baseResellerFuel, rebrandedName: undefined }
      })
      const h = toolkit()

      await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

      expect(h.view).toHaveBeenCalledWith(
        'fuel-details/index',
        expect.objectContaining({
          heading: 'Check fuel details for Not provided'
        })
      )
    })
  })
})
