import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { SUPPLIER_TYPE } from '../common/constants/supplier-type.js'
import { ReviewFuelViewModelBuilder } from './review-fuel-helpers.js'

const { getFuelReviewMock, saveFuelReviewMock } = vi.hoisted(() => ({
  getFuelReviewMock: vi.fn(),
  saveFuelReviewMock: vi.fn()
}))

vi.mock('./review-fuel-data.js', () => ({
  getFuelReview: getFuelReviewMock,
  saveFuelReview: saveFuelReviewMock
}))

describe('#reviewFuelController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    getFuelReviewMock.mockReset()
    saveFuelReviewMock.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the manufacturer review page for a manufacturer fuel', async () => {
    getFuelReviewMock.mockResolvedValue({
      data: {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: 'app-0317'
      }
    })

    const response = await server.inject({
      method: 'GET',
      url: '/review-fuel/FUEL-001'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toContain('Review Kings Starterlog')
    expect(response.payload).toContain('Review test reports')
    expect(response.payload).toContain('Add test results')
  })

  test('renders the rebrand review page for a rebrand fuel', async () => {
    getFuelReviewMock.mockResolvedValue({
      data: {
        fuelId: 'FUEL-002',
        brandNames: 'Grillaedin White Quebracho',
        supplierType: SUPPLIER_TYPE.REBRAND,
        applicationId: 'app-0317'
      }
    })

    const response = await server.inject({
      method: 'GET',
      url: '/review-fuel/FUEL-002'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toContain('Review Grillaedin White Quebracho')
    expect(response.payload).toContain('Review letter from manufacturer')
    expect(response.payload).toContain(
      'Review letter from original manufacturer'
    )
    expect(response.payload).toContain('Add fuel description')
  })

  test('renders the correct manufacturer task list from the helper builder', () => {
    const viewModel = ReviewFuelViewModelBuilder.buildViewModel(
      {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: 'app-0317'
      },
      'FUEL-001'
    )

    expect(viewModel.documentationHeading).toBe('Review test reports')
    expect(viewModel.documentationTasks).toHaveLength(1)
    expect(viewModel.documentationTasks[0].title.text).toBe('Add test results')
    expect(viewModel.listingTasks).toHaveLength(1)
    expect(viewModel.listingTasks[0].title.text).toBe('Check fuel details')
  })

  test('renders the correct rebrand task list from the helper builder', () => {
    const viewModel = ReviewFuelViewModelBuilder.buildViewModel(
      {
        fuelId: 'FUEL-002',
        resellBrandName: 'Grillaedin White Quebracho',
        supplierType: SUPPLIER_TYPE.REBRAND,
        applicationId: 'app-0317'
      },
      'FUEL-002'
    )

    expect(viewModel.heading).toBe('Review Grillaedin White Quebracho')
    expect(viewModel.documentationHeading).toBe(
      'Review letter from manufacturer'
    )
    expect(viewModel.documentationTasks).toHaveLength(1)
    expect(viewModel.documentationTasks[0].title.text).toBe(
      'Review letter from original manufacturer'
    )
    expect(viewModel.listingTasks).toHaveLength(2)
    expect(viewModel.listingTasks[1].title.text).toBe('Add fuel description')
  })

  test('builds the incomplete review view model with the expected GOV.UK links', () => {
    const viewModel = ReviewFuelViewModelBuilder.buildIncompleteReviewViewModel(
      {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: '7756-0001'
      },
      'FUEL-001'
    )

    expect(viewModel.pageTitle).toBe('Incomplete review')
    expect(viewModel.heading).toBe('Incomplete review')
    expect(viewModel.intro).toBe(
      'You cannot accept Kings Starterlog for government approval until:'
    )
    expect(viewModel.returnLinkText).toBe('Return to Kings Starterlog review')
    expect(viewModel.backLink).toEqual({ href: '/review-fuel/FUEL-001' })
    expect(viewModel.breadcrumbs.at(-1)).toEqual({
      text: 'Kings Starterlog',
      href: '/review-fuel/FUEL-001'
    })
  })

  test('renders the incomplete review page when the fuel cannot be accepted yet', async () => {
    getFuelReviewMock.mockResolvedValue({
      data: {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: '7756-0001'
      }
    })

    const response = await server.inject({
      method: 'GET',
      url: '/review-fuel/FUEL-001/incomplete-review'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toContain('Incomplete review')
    expect(response.payload).toContain(
      'You cannot accept Kings Starterlog for government approval until:'
    )
    expect(response.payload).toContain('Return to Kings Starterlog review')
  })

  test('renders a not found page when the fuel does not exist', async () => {
    const error = new Error('Fuel not found')
    error.status = statusCodes.notFound
    getFuelReviewMock.mockRejectedValue(error)

    const response = await server.inject({
      method: 'GET',
      url: '/review-fuel/FUEL-003'
    })

    expect(response.statusCode).toBe(statusCodes.notFound)
    expect(response.payload).toContain(
      'Sorry, there is a problem with the service'
    )
  })

  test('accepts the fuel review and redirects to the application page', async () => {
    saveFuelReviewMock.mockResolvedValue({})
    getFuelReviewMock.mockResolvedValue({
      data: {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: 'app-0317'
      }
    })

    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel/FUEL-001',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      },
      payload: { decision: 'accept' }
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/review-fuel-application/app-0317')
    expect(saveFuelReviewMock).toHaveBeenCalledWith('FUEL-001', 'accepted', {
      name: 'John doe',
      email: 'test@yopmail.com'
    })
  })

  test('rejects the fuel review and redirects to the application page', async () => {
    saveFuelReviewMock.mockResolvedValue({})
    getFuelReviewMock.mockResolvedValue({
      data: {
        fuelId: 'FUEL-001',
        brandNames: 'Kings Starterlog',
        supplierType: SUPPLIER_TYPE.MANUFACTURER,
        applicationId: 'app-0317'
      }
    })

    const response = await server.inject({
      method: 'POST',
      url: '/review-fuel/FUEL-001',
      auth: {
        strategy: 'session',
        credentials: {
          isAuthenticated: true,
          user: { id: 'test', email: 'test@yopmail.com', name: 'John doe' }
        }
      },
      payload: { decision: 'reject' }
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/review-fuel-application/app-0317')
    expect(saveFuelReviewMock).toHaveBeenCalledWith('FUEL-001', 'rejected', {
      name: 'John doe',
      email: 'test@yopmail.com'
    })
  })

  test('renders the error page when the fuel fetch fails', async () => {
    getFuelReviewMock.mockRejectedValue(new Error('backend down'))

    const response = await server.inject({
      method: 'GET',
      url: '/review-fuel/FUEL-003'
    })

    expect(response.statusCode).toBe(statusCodes.internalServerError)
    expect(response.payload).toContain(
      'Sorry, there is a problem with the service'
    )
  })
})
