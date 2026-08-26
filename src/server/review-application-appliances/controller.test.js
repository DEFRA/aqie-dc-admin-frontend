import { beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleAppliancesApplicationRequest } from './controller.js'
const { getApplianceApplicationMock } = vi.hoisted(() => ({
  getApplianceApplicationMock: vi.fn()
}))

vi.mock('./application-data.js', () => ({
  getApplianceApplication: getApplianceApplicationMock
}))

const baseApplication = {
  id: 'app-1',
  companyName: 'Acme Ltd',
  linkedItems: [
    { modelName: 'Boiler 1', technicalReview: { status: 'new' } }
  ]
}

describe('#reviewApplicationAppliancesController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getApplianceApplicationMock.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the review page with application details', async () => {
    getApplianceApplicationMock.mockResolvedValue({
      data: { ...baseApplication, companyFullAddress: 'Line 1\nLine 2' }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Review appliance application')
  })

  test('renders error view when getApplianceApplication throws error', async () => {
    getApplianceApplicationMock.mockRejectedValue(new Error('backend down'))

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/review-appliance-application/app-1'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
  })
})

describe('#handleAppliancesApplicationRequest (unit)', () => {
  beforeEach(() => {
    getApplianceApplicationMock.mockReset()
  })

  test('uses companyFullAddress when provided, replacing newlines with <br>', async () => {
    getApplianceApplicationMock.mockResolvedValue({
      data: { ...baseApplication, companyFullAddress: 'Line 1\nLine 2\nLine 3' }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleAppliancesApplicationRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'review-application-appliances/index',
      expect.objectContaining({
        companyAddress: 'Line 1<br>Line 2<br>Line 3'
      })
    )
  })

  test('builds companyAddress from parts when companyFullAddress is absent', async () => {
    getApplianceApplicationMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyAddress: {
          line1: '1 High Street',
          line2: '',
          city: 'London',
          county: undefined,
          postcode: 'SW1A 1AA',
          country: 'UK'
        }
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleAppliancesApplicationRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'review-application-appliances/index',
      expect.objectContaining({
        companyAddress: '1 High Street<br>London<br>SW1A 1AA<br>UK'
      })
    )
  })

  test.each([
    ['new', 'Start review', 'Not started', 'govuk-tag--grey'],
    ['in_review', 'Continue review', 'In progress', 'govuk-tag--yellow'],
    ['accepted', 'Edit review', 'Accepted', 'govuk-tag--green'],
    ['rejected', 'Edit review', 'Rejected', 'govuk-tag--red']
  ])(
    'maps status %s to expected tag and action',
    async (status, actionText, label, colour) => {
      getApplianceApplicationMock.mockResolvedValue({
        data: {
          ...baseApplication,
          companyFullAddress: 'Line 1',
          linkedItems: [
            { modelName: 'Boiler 1', technicalReview: { status } }
          ]
        }
      })

      const view = vi.fn().mockReturnValue('rendered')
      const h = { view }

      await handleAppliancesApplicationRequest(
        { params: { applicationId: 'app-1' } },
        h
      )

      expect(view).toHaveBeenCalledWith(
        'review-application-appliances/index',
        expect.objectContaining({
          appliances: [
            expect.objectContaining({
              modelName: 'Boiler 1',
              tag: { text: actionText, label, colour },
              action: `<a href="/appliance-review">${actionText}</a>`
            })
          ]
        })
      )
    }
  )

  test('falls back to the new status when technicalReview status is missing', async () => {
    getApplianceApplicationMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyFullAddress: 'Line 1',
        linkedItems: [{ modelName: 'Boiler 1', technicalReview: {} }]
      }
    })

    const view = vi.fn().mockReturnValue('rendered')
    const h = { view }

    await handleAppliancesApplicationRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'review-application-appliances/index',
      expect.objectContaining({
        appliances: [
          expect.objectContaining({
            modelName: 'Boiler 1',
            tag: { text: 'Start review', label: 'Not started', colour: 'govuk-tag--grey' },
            action: '<a href="/appliance-review">Start review</a>'
          })
        ]
      })
    )
  })

  test('renders error view when getApplianceApplication throws', async () => {
    getApplianceApplicationMock.mockRejectedValue(new Error('backend down'))

    const code = vi.fn().mockReturnValue('rendered')
    const view = vi.fn().mockReturnValue({ code })
    const h = { view }

    await handleAppliancesApplicationRequest(
      { params: { applicationId: 'app-1' } },
      h
    )

    expect(view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({ message: '' })
    )
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
