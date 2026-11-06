import { vi } from 'vitest'
import { manufacturerLetterController as controller } from './controller.js'

const { getFuelMock, saveManufacturerLetterResultMock } = vi.hoisted(() => ({
  getFuelMock: vi.fn(),
  saveManufacturerLetterResultMock: vi.fn()
}))

vi.mock('./manufacturer-letter-data.js', () => ({
  getFuel: getFuelMock,
  saveManufacturerLetterResult: saveManufacturerLetterResultMock
}))

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

const baseFuel = {
  id: 'FUEL-1',
  name: 'Wood Pellets Premium',
  supplierType: 'Rebrand',
  applicationId: 'APP-001',
  technicalReview: { documentationChecks: {} }
}

describe('review-manufacturer-letter controller', () => {
  beforeEach(() => {
    getFuelMock.mockReset()
    saveManufacturerLetterResultMock.mockReset()
  })

  test('GET renders the page for Rebrand fuel', async () => {
    getFuelMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await controller.get({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'manufacturer-letter/index',
      expect.objectContaining({
        heading:
          'Review letter from original manufacturer of Wood Pellets Premium'
      })
    )
  })

  test('GET returns error view for non-Rebrand fuel', async () => {
    getFuelMock.mockResolvedValue({
      data: { ...baseFuel, supplierType: 'Manufacture' }
    })
    const h = toolkit()

    await controller.get({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Manufacturer letter does not apply to a Manufacture fuel'
    })
  })

  test('GET returns error view on backend failure', async () => {
    getFuelMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.get({ params: { fuelId: 'FUEL-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })

  test('POST records the pass result and redirects to review page (pass)', async () => {
    saveManufacturerLetterResultMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post(
      { params: { fuelId: 'FUEL-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(saveManufacturerLetterResultMock).toHaveBeenCalledWith(
      'FUEL-1',
      true
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1')
  })

  test('POST records the fail result and redirects to review page (fail)', async () => {
    saveManufacturerLetterResultMock.mockResolvedValue({})
    const h = toolkit()

    await controller.post(
      { params: { fuelId: 'FUEL-1' }, payload: { decision: 'fail' } },
      h
    )

    expect(saveManufacturerLetterResultMock).toHaveBeenCalledWith(
      'FUEL-1',
      false
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel/FUEL-1')
  })

  test('POST returns error view on backend failure', async () => {
    saveManufacturerLetterResultMock.mockRejectedValue(new Error('boom'))
    const h = toolkit()

    await controller.post(
      { params: { fuelId: 'FUEL-1' }, payload: { decision: 'pass' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
  })
})
