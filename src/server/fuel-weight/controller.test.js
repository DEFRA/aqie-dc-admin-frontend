import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelWeightRequest,
  handleFuelWeightSaveRequest
} from './controller.js'

const { getFuelWeightMock, saveFuelWeightMock } = vi.hoisted(() => ({
  getFuelWeightMock: vi.fn(),
  saveFuelWeightMock: vi.fn()
}))

vi.mock('./fuel-weight-data.js', () => ({
  getFuelWeight: getFuelWeightMock,
  saveFuelWeight: saveFuelWeightMock
}))

const baseFuel = {
  id: 'fuel-uuid-1',
  supplierType: 'Manufacture',
  name: 'Kings Starterlog'
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

const getRequest = () => ({ params: { fuelId: 'fuel-uuid-1' } })
const postRequest = (payload) => ({
  params: { fuelId: 'fuel-uuid-1' },
  payload
})

describe('#handleFuelWeightRequest', () => {
  beforeEach(() => {
    getFuelWeightMock.mockReset()
  })

  test('renders an empty form when fuelDescription is missing', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    const [template, viewModel] = h.view.mock.calls[0]
    expect(template).toBe('fuel-weight/index')
    expect(viewModel.formValue).toBe('')
    expect(viewModel.error).toBeNull()
    expect(viewModel.pageTitle).toBe('What does the fuel weigh?')
    expect(viewModel.fuelWeightAction).toBe(
      '/review-fuel/fuel-uuid-1/fuel-weight'
    )
  })

  test('renders an empty form when weight is null', async () => {
    getFuelWeightMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { weight: null } }
    })
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('')
  })

  test('prefills the saved weight', async () => {
    getFuelWeightMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { weight: '600 grams' } }
    })
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('600 grams')
  })

  test('provides a cancel/return link', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].fuelDetailsHref).toEqual(expect.any(String))
  })

  test('fetches the fuel by ID', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    expect(getFuelWeightMock).toHaveBeenCalledWith('fuel-uuid-1')
  })

  test('renders error page when the fetch fails', async () => {
    getFuelWeightMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelWeightRequest(getRequest(), h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleFuelWeightSaveRequest', () => {
  beforeEach(() => {
    getFuelWeightMock.mockReset()
    saveFuelWeightMock.mockReset()
  })

  test('saves the trimmed weight and redirects', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    saveFuelWeightMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelWeightSaveRequest(
      postRequest({ weight: '  600 grams  ' }),
      h
    )

    expect(saveFuelWeightMock).toHaveBeenCalledWith('fuel-uuid-1', '600 grams')
    expect(h.redirect).toHaveBeenCalledTimes(1)
    expect(h.view).not.toHaveBeenCalled()
  })

  test.each([[''], ['   '], [undefined]])(
    'shows the required error without saving when weight is %j',
    async (weight) => {
      getFuelWeightMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleFuelWeightSaveRequest(postRequest({ weight }), h)

      expect(saveFuelWeightMock).not.toHaveBeenCalled()
      expect(h.redirect).not.toHaveBeenCalled()

      const [template, viewModel] = h.view.mock.calls[0]
      expect(template).toBe('fuel-weight/index')
      expect(viewModel.pageTitle).toBe('Error: What does the fuel weigh?')
      expect(viewModel.error).toEqual({
        field: 'weight',
        message: 'Enter the weight of the fuel',
        href: '#weight'
      })
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test('redisplays the entered value when validation fails', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelWeightSaveRequest(postRequest({ weight: '   ' }), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('   ')
  })

  test('renders error page when the save fails', async () => {
    getFuelWeightMock.mockResolvedValue({ data: baseFuel })
    saveFuelWeightMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelWeightSaveRequest(postRequest({ weight: '1 kg' }), h)

    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the fuel fetch fails before saving', async () => {
    getFuelWeightMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelWeightSaveRequest(postRequest({ weight: '1 kg' }), h)

    expect(saveFuelWeightMock).not.toHaveBeenCalled()
    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
