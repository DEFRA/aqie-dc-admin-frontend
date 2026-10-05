import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import {
  handleApplianceTypeRequest,
  handleApplianceTypeDecisionRequest
} from './controller.js'

const {
  getApplianceForApplianceTypeMock,
  saveApplianceTypeMock,
  getApplianceTypesMock
} = vi.hoisted(() => ({
  getApplianceForApplianceTypeMock: vi.fn(),
  saveApplianceTypeMock: vi.fn(),
  getApplianceTypesMock: vi.fn()
}))

vi.mock('./appliance-type-data.js', () => ({
  getApplianceForApplianceType: getApplianceForApplianceTypeMock,
  saveApplianceType: saveApplianceTypeMock,
  getApplianceTypes: getApplianceTypesMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M40i',
  applianceType: 'Stove'
}

const applianceTypes = [
  { value: 'Stove' },
  { value: 'Boiler' },
  { value: 'Inset appliance' },
  { value: 'Cooker' },
  { value: 'Pizza oven' },
  { value: 'Other' }
]

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleApplianceTypeRequest', () => {
  beforeEach(() => {
    getApplianceForApplianceTypeMock.mockReset()
    saveApplianceTypeMock.mockReset()
    getApplianceTypesMock.mockReset()
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
  })

  test('renders the page with current appliance type pre-populated', async () => {
    getApplianceForApplianceTypeMock.mockResolvedValue({ data: appliance })
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
    const h = toolkit()

    await handleApplianceTypeRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(getApplianceTypesMock).toHaveBeenCalledWith(true)
    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.selectedType).toBe('Stove')
    expect(viewModel.appliance).toEqual(appliance)
    expect(viewModel.applianceTypeItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'Stove',
          text: 'Stove',
          checked: true
        }),
        expect.objectContaining({
          value: 'Boiler',
          text: 'Boiler',
          checked: false
        })
      ])
    )
  })

  test('renders error page when fetch fails', async () => {
    getApplianceForApplianceTypeMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleApplianceTypeRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handleApplianceTypeDecisionRequest', () => {
  beforeEach(() => {
    getApplianceForApplianceTypeMock.mockReset()
    saveApplianceTypeMock.mockReset()
    getApplianceTypesMock.mockReset()
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
  })

  test('saves appliance type and redirects', async () => {
    saveApplianceTypeMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { applianceType: 'Boiler' }
      },
      h
    )

    expect(saveApplianceTypeMock).toHaveBeenCalledWith('APP-1', 'Boiler')
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('shows validation error when no appliance type selected', async () => {
    getApplianceForApplianceTypeMock.mockResolvedValue({ data: appliance })
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
    const h = toolkit()

    await handleApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { applianceType: '' }
      },
      h
    )

    expect(saveApplianceTypeMock).not.toHaveBeenCalled()
    expect(getApplianceTypesMock).toHaveBeenCalledWith(true)
    expect(h.view).toHaveBeenCalledWith(
      'appliance-type/index',
      expect.objectContaining({
        error: {
          field: 'applianceType',
          message: 'Select an appliance type',
          href: '#appliance-type'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('rejects an appliance type that is no longer supported by the database values', async () => {
    getApplianceForApplianceTypeMock.mockResolvedValue({ data: appliance })
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
    const h = toolkit()

    await handleApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { applianceType: 'Independent boiler' }
      },
      h
    )

    expect(saveApplianceTypeMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'appliance-type/index',
      expect.objectContaining({
        error: {
          field: 'applianceType',
          message: 'Select an appliance type',
          href: '#appliance-type'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveApplianceTypeMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { applianceType: 'Pizza oven' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('sets the cancel link back to the appliance details page', async () => {
    getApplianceForApplianceTypeMock.mockResolvedValue({ data: appliance })
    getApplianceTypesMock.mockResolvedValue(applianceTypes)
    const h = toolkit()

    await handleApplianceTypeRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'appliance-type/index',
      expect.objectContaining({
        applianceDetailsHref: '/review-appliance/APP-1/appliance-details'
      })
    )
  })

  test('saves Other appliance type', async () => {
    saveApplianceTypeMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handleApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'APP-1' },
        payload: { applianceType: 'Other' }
      },
      h
    )

    expect(saveApplianceTypeMock).toHaveBeenCalledWith('APP-1', 'Other')
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })
})
