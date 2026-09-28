import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  nominalOutputController,
  nominalOutputSaveController
} from './controller.js'

const { getApplianceForNominalOutputMock, saveNominalOutputMock } = vi.hoisted(
  () => ({
    getApplianceForNominalOutputMock: vi.fn(),
    saveNominalOutputMock: vi.fn()
  })
)

vi.mock('./nominal-output-data.js', () => ({
  getApplianceForNominalOutput: getApplianceForNominalOutputMock,
  saveNominalOutput: saveNominalOutputMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Jotmaster 50i Mk2',
  nominalOutput: 6.3,
  technicalReview: {
    status: 'in_review',
    listingChecks: { applianceDetails: null }
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

describe('#nominalOutputController (GET)', () => {
  beforeEach(() => {
    getApplianceForNominalOutputMock.mockReset()
    saveNominalOutputMock.mockReset()
  })

  test('renders the page with heading and current nominal output as form value', async () => {
    getApplianceForNominalOutputMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await nominalOutputController.handler(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'nominal-output/index',
      expect.objectContaining({
        heading: 'What is the nominal (thermal) output of Jotmaster 50i Mk2?',
        formValue: 6.3,
        error: null
      })
    )
  })

  test('uses empty string as form value when nominalOutput is null', async () => {
    getApplianceForNominalOutputMock.mockResolvedValue({
      data: { ...appliance, nominalOutput: null }
    })
    const h = toolkit()

    await nominalOutputController.handler(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.formValue).toBe('')
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForNominalOutputMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await nominalOutputController.handler(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#nominalOutputSaveController (POST)', () => {
  beforeEach(() => {
    getApplianceForNominalOutputMock.mockReset()
    saveNominalOutputMock.mockReset()
  })

  test('saves the parsed float and redirects to appliance-details', async () => {
    saveNominalOutputMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: '6.3' } },
      h
    )

    expect(saveNominalOutputMock).toHaveBeenCalledWith('APP-1', 6.3)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('encodes appliance id in redirect', async () => {
    saveNominalOutputMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP/1' }, payload: { nominalOutput: '5' } },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP%2F1/appliance-details'
    )
  })

  test('re-renders with required error when input is empty', async () => {
    getApplianceForNominalOutputMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: '' } },
      h
    )

    expect(saveNominalOutputMock).not.toHaveBeenCalled()
    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.error.message).toBe(
      'Enter the nominal (thermal) output of the appliance'
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('re-renders with required error when input is non-numeric', async () => {
    getApplianceForNominalOutputMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: 'abc' } },
      h
    )

    expect(saveNominalOutputMock).not.toHaveBeenCalled()
    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.error.message).toBe(
      'Enter the nominal (thermal) output of the appliance'
    )
  })

  test('re-renders with tooHigh error when value is 1000 or above', async () => {
    getApplianceForNominalOutputMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: '1000' } },
      h
    )

    expect(saveNominalOutputMock).not.toHaveBeenCalled()
    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.error.message).toBe(
      'Nominal (thermal) output must be less than 1,000 kW'
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveNominalOutputMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: '6.3' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
    expect(h.redirect).not.toHaveBeenCalled()
  })

  test('renders error page when re-fetch fails during validation error', async () => {
    getApplianceForNominalOutputMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await nominalOutputSaveController.handler(
      { params: { applianceId: 'APP-1' }, payload: { nominalOutput: '' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
