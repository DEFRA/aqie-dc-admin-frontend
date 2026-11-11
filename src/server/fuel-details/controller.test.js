import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelDetailsRequest,
  handleFuelDetailsMarkCompleteRequest
} from './controller.js'

const { getFuelDetailsMock, markFuelDetailsCompletedMock } = vi.hoisted(() => ({
  getFuelDetailsMock: vi.fn(),
  markFuelDetailsCompletedMock: vi.fn()
}))

vi.mock('./fuel-details-data.js', () => ({
  getFuelDetails: getFuelDetailsMock,
  markFuelDetailsCompleted: markFuelDetailsCompletedMock
}))

const baseFuel = {
  id: 'fuel-uuid-1',
  applicationId: 'app-uuid-1',
  supplierType: 'Manufacture',
  name: 'Kings Starterlog',
  additionalBrandNames: [],
  hasAdditionalBrandNames: false,
  fuelDescription: {
    appearance: 'Are firelogs that are approx. 220mm in length',
    weight: 'Has an average weight of approx. 600 grams',
    composition: 'Comprises of slack wax',
    sulphurContent: 0.1
  },
  manufacturingProcess: 'Was manufactured by heat treatment',
  hasQualityControlSystem: true,
  technicalReview: { listingChecks: { fuelDetails: false } }
}

const baseRebranderFuel = {
  id: 'fuel-uuid-2',
  applicationId: 'app-uuid-1',
  supplierType: 'Rebrand',
  name: 'Grillaedin White Quebracho',
  additionalBrandNames: [],
  hasAdditionalBrandNames: false,
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
  technicalReview: { listingChecks: { fuelDetails: false } }
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
  })

  test('renders the fuel details page with heading and title from fuel.name', async () => {
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
    expect(valueFor('Sulphur content')).toBe(0.1)
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

  test('uses "Not provided" as the heading when name is absent', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: { ...baseFuel, name: undefined }
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

  test('sets isAlreadyComplete to false when fuelDetails check is not set', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.isAlreadyComplete).toBe(false)
  })

  test('sets isAlreadyComplete to true when fuelDetails check is complete', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseFuel,
        technicalReview: { listingChecks: { fuelDetails: true } }
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.isAlreadyComplete).toBe(true)
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

  test('rebrander: uses fuel.name in the heading for a rebrand fuel', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'fuel-details/index',
      expect.objectContaining({
        heading: 'Check fuel details for Grillaedin White Quebracho'
      })
    )
  })

  test('rebrander: builds 5 summary rows when additionalBrandNames is empty and isChangedOrMixed is false', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(5)
  })

  test('rebrander: builds 6 summary rows when isChangedOrMixed is true', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          ...baseRebranderFuel.originalFuel,
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

  test('rebrander: shows originalFuel fields', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
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

  test('rebrander: shows changes detail row when isChangedOrMixed is true', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          ...baseRebranderFuel.originalFuel,
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

  test('rebrander: omits changes detail row when isChangedOrMixed is false', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Detail of changes'
    )
    expect(row).toBeUndefined()
  })

  test('rebrander: omits hasQualityControlSystem row', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const row = viewModel.summaryRows.find(
      (r) => r.key.text === 'Monitored quality control system'
    )
    expect(row).toBeUndefined()
  })

  test('displays "Not provided" when originalFuel fields are null', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          manufacturer: null,
          name: null,
          isChangedOrMixed: false,
          changes: null
        }
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const valueFor = (label) =>
      viewModel.summaryRows.find((r) => r.key.text === label)?.value.text

    expect(valueFor('Original fuel manufacturer')).toBe('Not provided')
    expect(valueFor('Original fuel name or brand')).toBe('Not provided')
    expect(valueFor('Changes made to original fuel')).toBe('No')
  })

  test('does not show changes row when isChangedOrMixed is false with null originalFuel fields', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          manufacturer: null,
          name: null,
          isChangedOrMixed: false,
          changes: null
        }
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const changesRow = viewModel.summaryRows.find(
      (r) => r.key.text === 'Detail of changes'
    )
    expect(changesRow).toBeUndefined()
  })

  test('shows changes row with value when isChangedOrMixed is true with normalized originalFuel', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          manufacturer: 'Some Manufacturer',
          name: 'Some Fuel',
          isChangedOrMixed: true,
          changes: 'Pieces were ground to finer size'
        }
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const changesRow = viewModel.summaryRows.find(
      (r) => r.key.text === 'Detail of changes'
    )
    expect(changesRow).toBeDefined()
    expect(changesRow.value.text).toBe('Pieces were ground to finer size')
  })

  test('displays isChangedOrMixed as Yes when true', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseRebranderFuel,
        originalFuel: {
          manufacturer: 'Mfg',
          name: 'Fuel',
          isChangedOrMixed: true,
          changes: 'Modified'
        }
      }
    })
    const h = toolkit()

    await handleFuelDetailsRequest({ params: { fuelId: 'fuel-uuid-2' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    const changedRow = viewModel.summaryRows.find(
      (r) => r.key.text === 'Changes made to original fuel'
    )
    expect(changedRow.value.text).toBe('Yes')
  })
})

describe('#handleFuelDetailsMarkCompleteRequest', () => {
  beforeEach(() => {
    getFuelDetailsMock.mockReset()
    markFuelDetailsCompletedMock.mockReset()
  })

  test('marks fuelDetails complete and redirects for a manufacturer', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    markFuelDetailsCompletedMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    expect(markFuelDetailsCompletedMock).toHaveBeenCalledWith('fuel-uuid-1')
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-1')
  })

  test('marks fuelDetails complete and redirects for a rebrand', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseRebranderFuel })
    markFuelDetailsCompletedMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-2' } },
      h
    )

    expect(markFuelDetailsCompletedMock).toHaveBeenCalledWith('fuel-uuid-2')
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-2')
  })

  test('redirects without saving when fuelDetails check is already complete', async () => {
    getFuelDetailsMock.mockResolvedValue({
      data: {
        ...baseFuel,
        technicalReview: { listingChecks: { fuelDetails: true } }
      }
    })
    const h = toolkit()

    await handleFuelDetailsMarkCompleteRequest(
      { params: { fuelId: 'fuel-uuid-1' } },
      h
    )

    expect(markFuelDetailsCompletedMock).not.toHaveBeenCalled()
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/fuel-uuid-1')
  })

  test('renders error page when the save fails', async () => {
    getFuelDetailsMock.mockResolvedValue({ data: baseFuel })
    markFuelDetailsCompletedMock.mockRejectedValue(new Error('backend down'))
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

    expect(markFuelDetailsCompletedMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
