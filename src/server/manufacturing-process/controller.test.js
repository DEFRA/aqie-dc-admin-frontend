import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleManufacturingProcessRequest,
  handleManufacturingProcessSaveRequest
} from './controller.js'

const { getMock, saveMock, returnHrefMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  saveMock: vi.fn(),
  returnHrefMock: vi.fn()
}))

vi.mock('./manufacturing-process-data.js', () => ({
  getManufacturingProcess: getMock,
  saveManufacturingProcess: saveMock
}))
vi.mock('../common/helpers/fuel-description-field-return-href.js', () => ({
  getFuelDescriptionFieldReturnHref: returnHrefMock
}))

const RETURN_HREF = '/review-fuel/fuel-uuid-1/fuel-description'
const baseFuel = { id: 'fuel-uuid-1', supplierType: 'Manufacture' }

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

beforeEach(() => {
  getMock.mockReset()
  saveMock.mockReset()
  returnHrefMock.mockReset().mockReturnValue(RETURN_HREF)
})

describe('#handleManufacturingProcessRequest', () => {
  test('renders an empty form when manufacturingProcess is missing', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleManufacturingProcessRequest(getRequest(), h)

    const [template, viewModel] = h.view.mock.calls[0]
    expect(template).toBe('manufacturing-process/index')
    expect(viewModel.value).toBe('')
    expect(viewModel.error).toBeNull()
    expect(viewModel.returnHref).toBe(RETURN_HREF)
    expect(viewModel.manufacturingProcessAction).toBe(
      '/review-fuel/fuel-uuid-1/manufacturing-process'
    )
    expect(returnHrefMock).toHaveBeenCalledWith(baseFuel, 'fuel-uuid-1')
  })

  test('renders an empty form when manufacturingProcess is null', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, manufacturingProcess: null }
    })
    const h = toolkit()

    await handleManufacturingProcessRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].value).toBe('')
  })

  test('prefills the saved value', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, manufacturingProcess: 'Pressed and dried' }
    })
    const h = toolkit()

    await handleManufacturingProcessRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].value).toBe('Pressed and dried')
  })

  test('renders the error page when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleManufacturingProcessRequest(getRequest(), h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleManufacturingProcessSaveRequest', () => {
  test('saves the trimmed value and redirects to the return link', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockResolvedValue({})
    const h = toolkit()

    await handleManufacturingProcessSaveRequest(
      postRequest({ manufacturingProcess: '  Pressed and dried  ' }),
      h
    )

    expect(saveMock).toHaveBeenCalledWith('fuel-uuid-1', 'Pressed and dried')
    expect(h.redirect).toHaveBeenCalledWith(RETURN_HREF)
  })

  test.each([[''], ['   '], [undefined]])(
    'shows the ticket error without saving for %j',
    async (value) => {
      getMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleManufacturingProcessSaveRequest(
        postRequest({ manufacturingProcess: value }),
        h
      )

      expect(saveMock).not.toHaveBeenCalled()
      expect(h.redirect).not.toHaveBeenCalled()
      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.returnHref).toBe(RETURN_HREF)
      expect(viewModel.error).toEqual({
        field: 'manufacturingProcess',
        message: 'Enter details of how the fuel is manufactured',
        href: '#manufacturingProcess'
      })
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test('renders the error page when the save fails', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleManufacturingProcessSaveRequest(
      postRequest({ manufacturingProcess: 'Kiln-dried' }),
      h
    )

    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders the error page when the fuel fetch fails', async () => {
    getMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleManufacturingProcessSaveRequest(
      postRequest({ manufacturingProcess: 'Kiln-dried' }),
      h
    )

    expect(saveMock).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
