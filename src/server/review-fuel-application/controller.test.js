import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { reviewFuelApplicationContent } from './content.js'
import {
  handleReviewFuelApplicationRequest,
  handleStartFuelApplicationReviewRequest
} from './controller.js'

const content = reviewFuelApplicationContent.en

const { getFuelApplicationDetailsMock, startFuelApplicationReviewMock } =
  vi.hoisted(() => ({
    getFuelApplicationDetailsMock: vi.fn(),
    startFuelApplicationReviewMock: vi.fn()
  }))

vi.mock('./review-fuel-application-data.js', () => ({
  getFuelApplicationDetails: getFuelApplicationDetailsMock,
  startFuelApplicationReview: startFuelApplicationReviewMock
}))

const baseApplication = {
  id: '7756-0001',
  companyName: 'Flamers Ltd',
  fullAddress: ['Sonna', 'Mullingar', 'Co. Westmeath', 'N91 PYC8'],
  companyContact: {
    name: 'Contact Name',
    email: 'contact.email@flamers.com',
    alternativeEmail: 'alt.email@flamers.com',
    phone: '07722 334455'
  },
  responsiblePerson: {
    name: 'Responsible Name',
    email: 'responsible.email@flamers.com'
  },
  hasCustomerComplaintsSystem: true,
  fuelBagging: 'Bagged at source',
  supplierType: 'Manufacture',
  linkedItems: [
    {
      id: 'FUEL-123',
      brandName: 'Kings Starterlog',
      technicalReview: { status: 'in_review' }
    }
  ]
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleReviewFuelApplicationRequest', () => {
  beforeEach(() => {
    getFuelApplicationDetailsMock.mockReset()
  })

  test('renders the fuel application details page with the correct title and heading', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: '7756-0001' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'review-fuel-application/index',
      expect.objectContaining({
        pageTitle: content.pageTitle('0001'),
        heading: content.heading('0001')
      })
    )
  })

  test('builds the applicant summary rows for the GOV.UK details page', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(11)
    expect(viewModel.summaryRows[0].value.text).toBe('Flamers Ltd')
    expect(viewModel.summaryRows[1].value.html).toContain('Sonna')
    expect(viewModel.summaryRows[7].value.text).toBe(
      'responsible.email@flamers.com'
    )
    expect(viewModel.summaryRows[8].value.text).toBe(content.boolean.yes)
  })

  test('joins fullAddress lines with <br> and escapes HTML', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        fullAddress: ['1 High St', 'Leeds', '<b>LS1 1AA</b>', 'England']
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[1].value.html).toBe(
      '1 High St<br>Leeds<br>&lt;b&gt;LS1 1AA&lt;/b&gt;<br>England'
    )
  })

  test('renders the error page when fullAddress is missing', async () => {
    const { fullAddress: _omit, ...applicationWithoutAddress } = baseApplication
    const h = toolkit()

    getFuelApplicationDetailsMock.mockResolvedValue({
      data: applicationWithoutAddress
    })
    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: content.errors.generic
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders a single-line fullAddress without <br>', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        fullAddress: ['456 Rue de Paris, Paris, France']
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[1].value.html).toBe(
      '456 Rue de Paris, Paris, France'
    )
  })

  test('renders the fuel table with status labels and continue-review action', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelRows).toHaveLength(1)
    expect(viewModel.fuelRows[0]).toMatchObject({
      brandName: 'Kings Starterlog',
      statusLabel: 'In progress',
      actionText: 'Continue review',
      actionHref: '/review-fuel/FUEL-123'
    })
    expect(viewModel.continueReviewHref).toBe('/incomplete-review')
  })

  test('maps the backend brandName field to the fuel table row', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: [
          {
            ...baseApplication.linkedItems[0],
            brandName: 'PelletBrand'
          }
        ]
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelRows[0].brandName).toBe('PelletBrand')
  })

  test('maps the backend supplierType enum values to the correct user-facing labels', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        supplierType: 'Manufacture'
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    let [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[10].value.text).toBe('Manufacturer')

    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        supplierType: 'Rebrand'
      }
    })

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )
    ;[, viewModel] = h.view.mock.calls[1]
    expect(viewModel.summaryRows[10].value.text).toBe('Rebrander')
  })

  test('does not fall back to the application id when constructing the fuel review link', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: [
          {
            brandName: 'Test fuel',
            technicalReview: { status: 'new' },
            id: 'legacy-id'
          }
        ]
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.fuelRows[0].actionHref).toBe('/review-fuel/legacy-id')
  })

  test('returns the generic error page when technicalReview.status is missing instead of silently defaulting to new', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: [
          {
            ...baseApplication.linkedItems[0],
            technicalReview: {}
          }
        ]
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: content.errors.generic
    })
  })

  test('renders the empty state when there are no linked items', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: []
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'review-fuel-application/index',
      expect.objectContaining({ fuelRows: [] })
    )
  })

  test('shows not provided when alternative email and phone are null', async () => {
    getFuelApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyContact: {
          ...baseApplication.companyContact,
          alternativeEmail: null,
          phone: null
        }
      }
    })
    const h = toolkit()

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[4].value.text).toBe(content.notProvided)
    expect(viewModel.summaryRows[5].value.text).toBe(content.notProvided)
  })

  test('starts the review and redirects back to the application page', async () => {
    startFuelApplicationReviewMock.mockResolvedValue({ success: true })
    const h = {
      redirect: vi.fn().mockReturnValue('redirected')
    }

    await handleStartFuelApplicationReviewRequest(
      {
        params: { applicationId: 'app-0317' },
        auth: {
          credentials: {
            user: { name: 'Jane Doe', email: 'jane@example.com' }
          }
        }
      },
      h
    )

    expect(startFuelApplicationReviewMock).toHaveBeenCalledWith('app-0317', {
      name: 'Jane Doe',
      email: 'jane@example.com'
    })
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel-application/app-0317')
  })

  test('falls back to unknown reviewer values when the auth user is incomplete', async () => {
    startFuelApplicationReviewMock.mockResolvedValue({ success: true })
    const h = {
      redirect: vi.fn().mockReturnValue('redirected')
    }

    await handleStartFuelApplicationReviewRequest(
      {
        params: { applicationId: 'app-0317' },
        auth: { credentials: { user: { name: 'Jane Doe' } } }
      },
      h
    )

    expect(startFuelApplicationReviewMock).toHaveBeenCalledWith('app-0317', {
      name: 'Jane Doe',
      email: 'unknown-reviewer@unknown.gov.uk'
    })
    expect(h.redirect).toHaveBeenCalledWith('/review-fuel-application/app-0317')
  })

  test('redirects back to the application page when the backend rejects a review start as a conflict', async () => {
    startFuelApplicationReviewMock.mockRejectedValue({ status: 409 })
    const h = {
      redirect: vi.fn().mockReturnValue('redirected')
    }

    await handleStartFuelApplicationReviewRequest(
      {
        params: { applicationId: 'app-0317' },
        auth: {
          credentials: {
            user: { name: 'Jane Doe', email: 'jane@example.com' }
          }
        }
      },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith('/review-fuel-application/app-0317')
  })

  test('renders the standard error page when the data fetch fails', async () => {
    getFuelApplicationDetailsMock.mockRejectedValue(new Error('backend down'))
    const h = {
      view: vi
        .fn()
        .mockReturnValue({ code: vi.fn().mockReturnValue('error-page') }),
      code: vi.fn()
    }

    await handleReviewFuelApplicationRequest(
      { params: { applicationId: 'app-0317' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'error/index',
      expect.objectContaining({
        message: content.errors.generic
      })
    )
    expect(h.view.mock.results[0].value.code).toHaveBeenCalledWith(
      statusCodes.internalServerError
    )
  })
})
