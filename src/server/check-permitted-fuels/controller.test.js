import { beforeEach, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleCheckPermittedFuelsRequest,
  handleCheckPermittedFuelsDecisionRequest
} from './controller.js'

const { getApplianceForPermittedFuelsMock, savePermittedFuelsMock } =
  vi.hoisted(() => ({
    getApplianceForPermittedFuelsMock: vi.fn(),
    savePermittedFuelsMock: vi.fn()
  }))

vi.mock('./check-permitted-fuels-data.js', () => ({
  getApplianceForPermittedFuels: getApplianceForPermittedFuelsMock,
  savePermittedFuels: savePermittedFuelsMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat CS200i',
  applicationId: '1084',
  allowedFuels:
    'Gozney manufactured wood logs, length 280-310mm, diameter 95mm',
  isPermittedToBurnWood: true,
  technicalReview: {
    status: 'in_review',
    listingChecks: { permittedFuels: null }
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

describe('#handleCheckPermittedFuelsRequest', () => {
  beforeEach(() => {
    getApplianceForPermittedFuelsMock.mockReset()
    savePermittedFuelsMock.mockReset()
  })

  test('renders the page with heading and existing form values', async () => {
    getApplianceForPermittedFuelsMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleCheckPermittedFuelsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'check-permitted-fuels/index',
      expect.objectContaining({
        heading: 'Permitted fuels for Twin Heat CS200i',
        formValues: {
          permFuelsCS:
            'Gozney manufactured wood logs, length 280-310mm, diameter 95mm',
          woodCS: 'Yes'
        }
      })
    )
  })

  test('defaults to empty values if appliance fields are missing', async () => {
    getApplianceForPermittedFuelsMock.mockResolvedValue({
      data: { id: 'APP-1', modelName: 'Twin Heat CS200i' }
    })
    const h = toolkit()

    await handleCheckPermittedFuelsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]

    expect(viewModel.formValues).toEqual({ permFuelsCS: '', woodCS: undefined })
  })

  test('renders the error view when backend fetch fails', async () => {
    getApplianceForPermittedFuelsMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleCheckPermittedFuelsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleCheckPermittedFuelsDecisionRequest', () => {
  beforeEach(() => {
    getApplianceForPermittedFuelsMock.mockReset()
    savePermittedFuelsMock.mockReset()
  })

  test('saves answers and redirects to review page', async () => {
    savePermittedFuelsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleCheckPermittedFuelsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { permFuelsCS: 'Wood logs', woodCS: 'No' }
      },
      h
    )

    expect(savePermittedFuelsMock).toHaveBeenCalledWith(
      'APP-1',
      'Wood logs',
      false
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP-1')
  })

  test('encodes appliance id in redirect', async () => {
    savePermittedFuelsMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleCheckPermittedFuelsDecisionRequest(
      {
        params: { applianceId: 'APP/1' },
        payload: { permFuelsCS: 'Wood logs', woodCS: 'Yes' }
      },
      h
    )

    expect(savePermittedFuelsMock).toHaveBeenCalledWith(
      'APP/1',
      'Wood logs',
      true
    )
    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/APP%2F1')
  })

  test('renders error view when save fails', async () => {
    savePermittedFuelsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleCheckPermittedFuelsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { permFuelsCS: 'Wood logs', woodCS: 'Yes' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(h.redirect).not.toHaveBeenCalled()
  })

  test('re-renders with validation error when wood choice is missing', async () => {
    getApplianceForPermittedFuelsMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleCheckPermittedFuelsDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { permFuelsCS: 'Updated fuels' }
      },
      h
    )

    expect(savePermittedFuelsMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'check-permitted-fuels/index',
      expect.objectContaining({
        pageTitle: 'Error: Permitted fuels for Twin Heat CS200i',
        error: {
          message: 'Select if the appliance is cerified to burn wood',
          href: '#woodCS'
        },
        formValues: {
          permFuelsCS: 'Updated fuels',
          woodCS: undefined
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })
})
