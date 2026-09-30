import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleGet, handlePost } from './controller.js'

const { getApplianceForMultifuelMock, saveMultifuelApplianceMock } = vi.hoisted(
  () => ({
    getApplianceForMultifuelMock: vi.fn(),
    saveMultifuelApplianceMock: vi.fn()
  })
)

vi.mock('./multifuel-appliance-data.js', () => ({
  getApplianceForMultifuel: getApplianceForMultifuelMock,
  saveMultifuelAppliance: saveMultifuelApplianceMock
}))

const appliance = {
  id: 'APP-1',
  modelName: 'Twin Heat M20i',
  multifuelAppliance: true
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    redirect: vi.fn().mockReturnValue('redirected'),
    code
  }
}

describe('#handleGet', () => {
  beforeEach(() => {
    getApplianceForMultifuelMock.mockReset()
    saveMultifuelApplianceMock.mockReset()
  })

  test('renders the page with Yes pre-selected when multifuelAppliance is true', async () => {
    getApplianceForMultifuelMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleGet({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'multifuel-appliance/index',
      expect.objectContaining({
        pageTitle: 'Is Twin Heat M20i a multifuel appliance?',
        formValue: 'Yes'
      })
    )
  })

  test('renders the page with No pre-selected when multifuelAppliance is false', async () => {
    getApplianceForMultifuelMock.mockResolvedValue({
      data: { ...appliance, multifuelAppliance: false }
    })
    const h = toolkit()

    await handleGet({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'multifuel-appliance/index',
      expect.objectContaining({ formValue: 'No' })
    )
  })

  test('renders the page with no selection when multifuelAppliance is not set', async () => {
    getApplianceForMultifuelMock.mockResolvedValue({
      data: { ...appliance, multifuelAppliance: undefined }
    })
    const h = toolkit()

    await handleGet({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'multifuel-appliance/index',
      expect.objectContaining({ formValue: undefined })
    )
  })

  test('passes the correct formAction and cancel link', async () => {
    getApplianceForMultifuelMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handleGet({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'multifuel-appliance/index',
      expect.objectContaining({
        formAction: '/review-appliance/APP-1/multifuel-appliance',
        applianceDetailsHref: '/review-appliance/APP-1/appliance-details'
      })
    )
  })

  test('renders error page when backend fetch fails', async () => {
    getApplianceForMultifuelMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleGet({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('#handlePost', () => {
  beforeEach(() => {
    getApplianceForMultifuelMock.mockReset()
    saveMultifuelApplianceMock.mockReset()
  })

  test('saves true and redirects to appliance details when Yes is submitted', async () => {
    saveMultifuelApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handlePost(
      {
        params: { applianceId: 'APP-1' },
        payload: { multifuelAppliance: 'Yes' }
      },
      h
    )

    expect(saveMultifuelApplianceMock).toHaveBeenCalledWith('APP-1', true)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('saves false and redirects to appliance details when No is submitted', async () => {
    saveMultifuelApplianceMock.mockResolvedValue({ success: true })
    const h = toolkit()

    await handlePost(
      {
        params: { applianceId: 'APP-1' },
        payload: { multifuelAppliance: 'No' }
      },
      h
    )

    expect(saveMultifuelApplianceMock).toHaveBeenCalledWith('APP-1', false)
    expect(h.redirect).toHaveBeenCalledWith(
      '/review-appliance/APP-1/appliance-details'
    )
  })

  test('re-renders with validation error when no selection is made', async () => {
    getApplianceForMultifuelMock.mockResolvedValue({ data: appliance })
    const h = toolkit()

    await handlePost({ params: { applianceId: 'APP-1' }, payload: {} }, h)

    expect(saveMultifuelApplianceMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'multifuel-appliance/index',
      expect.objectContaining({
        pageTitle: 'Error: Is Twin Heat M20i a multifuel appliance?',
        error: {
          field: 'multifuelAppliance',
          message: 'Select yes if the appliance is a multifuel appliance',
          href: '#multifuelAppliance'
        }
      })
    )
    expect(h.code).toHaveBeenCalledWith(statusCodes.badRequest)
  })

  test('renders error page when save fails', async () => {
    saveMultifuelApplianceMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handlePost(
      {
        params: { applianceId: 'APP-1' },
        payload: { multifuelAppliance: 'Yes' }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when backend fetch fails during validation', async () => {
    getApplianceForMultifuelMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handlePost({ params: { applianceId: 'APP-1' }, payload: {} }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
