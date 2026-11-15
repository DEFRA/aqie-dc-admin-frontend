import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleFuelCompositionRequest,
  handleFuelCompositionSaveRequest
} from './controller.js'

const { getMock, saveMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  saveMock: vi.fn()
}))

vi.mock('./fuel-composition-data.js', () => ({
  getFuelComposition: getMock,
  saveFuelComposition: saveMock
}))

const baseFuel = { id: 'fuel-uuid-1', supplierType: 'Manufacture' }
const ERROR_MESSAGE = 'Enter details of the fuel’s overall composition'

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

describe('#handleFuelCompositionRequest', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  test('renders an empty form when fuelDescription is missing', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleFuelCompositionRequest(getRequest(), h)

    const [template, viewModel] = h.view.mock.calls[0]
    expect(template).toBe('fuel-composition/index')
    expect(viewModel.formValue).toBe('')
    expect(viewModel.error).toBeNull()
    expect(viewModel.fuelCompositionAction).toBe(
      '/review-fuel/fuel-uuid-1/fuel-composition'
    )
  })

  test('renders an empty form when composition is null', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { composition: null } }
    })
    const h = toolkit()

    await handleFuelCompositionRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('')
  })

  test('prefills the saved composition', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { composition: 'Slack wax' } }
    })
    const h = toolkit()

    await handleFuelCompositionRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('Slack wax')
  })

  test('renders the error page when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelCompositionRequest(getRequest(), h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleFuelCompositionSaveRequest', () => {
  beforeEach(() => {
    getMock.mockReset()
    saveMock.mockReset()
  })

  test('saves the trimmed composition and redirects', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockResolvedValue({})
    const h = toolkit()

    await handleFuelCompositionSaveRequest(
      postRequest({ composition: '  Slack wax  ' }),
      h
    )

    expect(saveMock).toHaveBeenCalledWith('fuel-uuid-1', 'Slack wax')
    expect(h.redirect).toHaveBeenCalledTimes(1)
    expect(h.view).not.toHaveBeenCalled()
  })

  test.each([[''], ['   '], [undefined]])(
    'shows the required error without saving when composition is %j',
    async (composition) => {
      getMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleFuelCompositionSaveRequest(postRequest({ composition }), h)

      expect(saveMock).not.toHaveBeenCalled()
      expect(h.redirect).not.toHaveBeenCalled()

      const [template, viewModel] = h.view.mock.calls[0]
      expect(template).toBe('fuel-composition/index')
      expect(viewModel.error).toEqual({
        field: 'composition',
        message: ERROR_MESSAGE,
        href: '#composition'
      })
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test('renders the error page when the save fails', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleFuelCompositionSaveRequest(
      postRequest({ composition: 'Slack wax' }),
      h
    )

    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})