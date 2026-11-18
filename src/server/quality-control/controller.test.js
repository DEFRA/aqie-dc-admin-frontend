import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleQualityControlRequest,
  handleQualityControlSaveRequest
} from './controller.js'

const { getMock, saveMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  saveMock: vi.fn()
}))

vi.mock('./quality-control-data.js', () => ({
  getQualityControl: getMock,
  saveQualityControl: saveMock
}))

const DETAILS_HREF = '/review-fuel/fuel-uuid-1/fuel-details'

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

// Braces matter: returning the mock from beforeEach makes Vitest call it as a
// cleanup function after each test, re-triggering mocked rejections.
beforeEach(() => {
  getMock.mockReset()
  saveMock.mockReset()
})

describe('#handleQualityControlRequest', () => {
  test.each([
    [true, 'yes'],
    [false, 'no'],
    [null, ''],
    [undefined, '']
  ])('maps saved value %j to %j', async (saved, expected) => {
    getMock.mockResolvedValue({ data: { hasQualityControlSystem: saved } })
    const h = toolkit()

    await handleQualityControlRequest(getRequest(), h)

    const [template, viewModel] = h.view.mock.calls[0]
    expect(template).toBe('quality-control/index')
    expect(viewModel.formValue).toBe(expected)
    expect(viewModel.error).toBeNull()
    expect(viewModel.fuelDetailsHref).toBe(DETAILS_HREF)
    expect(viewModel.qualityControlAction).toBe(
      '/review-fuel/fuel-uuid-1/quality-control'
    )
  })

  test('renders the error page when the fetch fails', async () => {
    getMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleQualityControlRequest(getRequest(), h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleQualityControlSaveRequest', () => {
  test.each([
    ['yes', true],
    ['no', false]
  ])('saves %j as %j and redirects', async (input, expected) => {
    saveMock.mockResolvedValue({})
    const h = toolkit()

    await handleQualityControlSaveRequest(
      postRequest({ qualityControl: input }),
      h
    )

    expect(saveMock).toHaveBeenCalledWith('fuel-uuid-1', expected)
    expect(h.redirect).toHaveBeenCalledWith(DETAILS_HREF)
    expect(h.view).not.toHaveBeenCalled()
  })

  test('renders the error page when the save fails', async () => {
    saveMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleQualityControlSaveRequest(
      postRequest({ qualityControl: 'yes' }),
      h
    )

    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
