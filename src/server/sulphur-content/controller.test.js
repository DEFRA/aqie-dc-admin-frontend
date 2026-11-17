import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleSulphurContentRequest,
  handleSulphurContentSaveRequest
} from './controller.js'

const { getMock, saveMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  saveMock: vi.fn()
}))

vi.mock('./sulphur-content-data.js', () => ({
  getSulphurContent: getMock,
  saveSulphurContent: saveMock
}))

const baseFuel = { id: 'fuel-uuid-1', supplierType: 'Manufacture' }
const REQUIRED_MESSAGE = 'Enter the fuel’s sulphur content'
const INVALID_MESSAGE = 'Sulphur content must be a number, like 5 or 0.1'
const TOO_HIGH_MESSAGE = 'Sulphur content must be 100 or less'

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

describe('#handleSulphurContentRequest', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  test('renders an empty form when fuelDescription is missing', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    const h = toolkit()

    await handleSulphurContentRequest(getRequest(), h)

    const [template, viewModel] = h.view.mock.calls[0]
    expect(template).toBe('sulphur-content/index')
    expect(viewModel.formValue).toBe('')
    expect(viewModel.error).toBeNull()
    expect(viewModel.sulphurContentAction).toBe(
      '/review-fuel/fuel-uuid-1/sulphur-content'
    )
  })

  test('renders an empty form when sulphurContent is null', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { sulphurContent: null } }
    })
    const h = toolkit()

    await handleSulphurContentRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe('')
  })

  test('prefills the saved sulphur content (number from backend)', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { sulphurContent: 0.1 } }
    })
    const h = toolkit()

    await handleSulphurContentRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe(0.1)
  })

  test('keeps a saved value of 0', async () => {
    getMock.mockResolvedValue({
      data: { ...baseFuel, fuelDescription: { sulphurContent: 0 } }
    })
    const h = toolkit()

    await handleSulphurContentRequest(getRequest(), h)

    expect(h.view.mock.calls[0][1].formValue).toBe(0)
  })

  test('renders the error page when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleSulphurContentRequest(getRequest(), h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleSulphurContentSaveRequest', () => {
  beforeEach(() => {
    getMock.mockReset()
    saveMock.mockReset()
  })

  test.each([
    ['5', '5'],
    ['0', '0'],
    ['0.1', '0.1'],
    ['100', '100'],
    ['  2.75  ', '2.75']
  ])('saves %j as %j and redirects', async (input, expected) => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockResolvedValue({})
    const h = toolkit()

    await handleSulphurContentSaveRequest(
      postRequest({ sulphurContent: input }),
      h
    )

    expect(saveMock).toHaveBeenCalledWith('fuel-uuid-1', expected)
    expect(h.redirect).toHaveBeenCalledTimes(1)
    expect(h.view).not.toHaveBeenCalled()
  })

  test.each([[''], ['   '], [undefined]])(
    'shows the required error without saving when value is %j',
    async (sulphurContent) => {
      getMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleSulphurContentSaveRequest(postRequest({ sulphurContent }), h)

      expect(saveMock).not.toHaveBeenCalled()
      expect(h.redirect).not.toHaveBeenCalled()
      expect(h.view.mock.calls[0][1].error).toEqual({
        field: 'sulphurContent',
        message: REQUIRED_MESSAGE,
        href: '#sulphurContent'
      })
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test.each([['abc'], ['-1'], ['1.'], ['.5'], ['1,5'], ['1.2.3'], ['5%']])(
    'shows the invalid error without saving when value is %j',
    async (sulphurContent) => {
      getMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleSulphurContentSaveRequest(postRequest({ sulphurContent }), h)

      const [, viewModel] = h.view.mock.calls[0]
      expect(saveMock).not.toHaveBeenCalled()
      expect(viewModel.error.message).toBe(INVALID_MESSAGE)
      expect(viewModel.formValue).toBe(sulphurContent)
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test.each([['100.1'], ['101'], ['1000']])(
    'shows the too-high error without saving when value is %j',
    async (sulphurContent) => {
      getMock.mockResolvedValue({ data: baseFuel })
      const h = toolkit()

      await handleSulphurContentSaveRequest(postRequest({ sulphurContent }), h)

      expect(saveMock).not.toHaveBeenCalled()
      expect(h.view.mock.calls[0][1].error.message).toBe(TOO_HIGH_MESSAGE)
      expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
    }
  )

  test('renders the error page when the save fails', async () => {
    getMock.mockResolvedValue({ data: baseFuel })
    saveMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleSulphurContentSaveRequest(
      postRequest({ sulphurContent: '0.1' }),
      h
    )

    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
