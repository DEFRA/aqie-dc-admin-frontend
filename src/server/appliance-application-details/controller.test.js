import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleApplianceApplicationDetailsRequest } from './controller.js'

const { getApplianceTechnicalReviewMock, getApplicationDetailsMock } =
  vi.hoisted(() => ({
    getApplianceTechnicalReviewMock: vi.fn(),
    getApplicationDetailsMock: vi.fn()
  }))

vi.mock('../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

vi.mock('./appliance-application-details-data.js', () => ({
  getApplicationDetails: getApplicationDetailsMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F',
  applicationId: 'app-uuid-123'
}

const baseApplication = {
  id: 'app-uuid-123',
  submittedAt: '2026-01-01T00:00:00.000Z',
  companyName: 'Arada Limited',
  companyFullAddress:
    'The Fireworks\nWeycroft Avenue\nAxminster\nDevon\nEX13 5HU',
  companyContact: {
    name: 'John Doe',
    email: 'john.doe@arada.co.uk',
    alternativeEmail: 'hello@arada.co.uk',
    phone: '07722 334455'
  },
  linkedItems: [
    { modelName: 'Aarrow Ecoburn 5F plus 4.9kW multi-fuel stove' },
    { modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove' }
  ]
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleApplianceApplicationDetailsRequest', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    getApplicationDetailsMock.mockReset()
  })

  test('renders the page with heading and title including the applicationId', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-application-details/index',
      expect.objectContaining({
        pageTitle: 'Application app-uuid-123 details',
        heading: 'Application app-uuid-123 details'
      })
    )
  })

  test('builds 8 summary rows', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(8)
  })

  test('formats submittedAt as "d MMMM yyyy"', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const dateRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Application date'
    )
    expect(dateRow.value.text).toBe('1 January 2026')
  })

  test('falls back to "Not provided" when submittedAt is absent', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: { ...baseApplication, submittedAt: undefined }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const dateRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Application date'
    )
    expect(dateRow.value.text).toBe('Not provided')
  })

  test('builds company address from companyFullAddress splitting on newlines', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const addressRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Company address'
    )
    expect(addressRow.value.html).toContain('The Fireworks')
    expect(addressRow.value.html).toContain('Weycroft Avenue')
    expect(addressRow.value.html).toContain('EX13 5HU')
  })

  test('builds company address from structured parts when companyFullAddress is absent', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyFullAddress: undefined,
        companyAddress: {
          line1: '456 Factory Road',
          line2: undefined,
          city: 'Birmingham',
          county: 'West Midlands',
          postcode: 'B1 2AB',
          country: 'UK'
        }
      }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const addressRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Company address'
    )
    expect(addressRow.value.html).toContain('456 Factory Road')
    expect(addressRow.value.html).toContain('Birmingham')
    expect(addressRow.value.html).toContain('B1 2AB')
    expect(addressRow.value.html).not.toContain('undefined')
  })

  test('renders linkedItems as a govuk bullet list', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const appliancesRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Appliances in this application'
    )
    expect(appliancesRow.value.html).toContain(
      'class="govuk-list govuk-list--bullet"'
    )
    expect(appliancesRow.value.html).toContain(
      '<li>Aarrow Ecoburn 5F plus 4.9kW multi-fuel stove</li>'
    )
    expect(appliancesRow.value.html).toContain(
      '<li>Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove</li>'
    )
    expect(appliancesRow.value.text).toBeUndefined()
  })

  test('renders "Not provided" when linkedItems is empty', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: { ...baseApplication, linkedItems: [] }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const appliancesRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Appliances in this application'
    )
    expect(appliancesRow.value.text).toBe('Not provided')
    expect(appliancesRow.value.html).toBeUndefined()
  })

  test('falls back to "Not provided" for missing alternativeEmail', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyContact: {
          ...baseApplication.companyContact,
          alternativeEmail: undefined
        }
      }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const altEmailRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Main contact alternative email'
    )
    expect(altEmailRow.value.text).toBe('Not provided')
  })

  test('falls back to "Not provided" for missing phone', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        companyContact: {
          ...baseApplication.companyContact,
          phone: undefined
        }
      }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const phoneRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Main contact telephone number'
    )
    expect(phoneRow.value.text).toBe('Not provided')
  })

  test('uses applicationId from the technical review response to fetch the application', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplicationDetailsMock).toHaveBeenCalledWith('app-uuid-123')
  })

  test('sets correct back link, return href, and breadcrumbs', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.backLink.href).toBe('/appliance-record/APP-1')
    expect(viewModel.returnHref).toBe('/appliance-record/APP-1')
    expect(viewModel.breadcrumbs).toEqual([
      { text: 'Home', href: '/manage-certification' },
      {
        text: 'Appliance records',
        href: '/appliance-records'
      },
      {
        text: 'Aarrow Ecoburn 5F',
        href: '/appliance-record/APP-1'
      }
    ])
  })

  describe('legacy records (isLegacyRecord: true)', () => {
    const legacyAppliance = { ...baseAppliance, isLegacyRecord: true }

    const legacyApplication = {
      id: 'app-uuid-123',
      companyName: 'Jetmaster Fires Limited',
      companyFullAddress: undefined,
      companyAddress: {
        line1: 'Unit 2',
        line2: 'Peacock Trading Estate',
        city: 'Eastleigh',
        county: 'Hampshire',
        postcode: 'SO50 4NT'
      },
      legacy: {
        linkedApplicationIds: ['CAA-EA-00000850']
      }
    }

    test('renders only 2 summary rows for a legacy record', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({ data: legacyApplication })
      const h = toolkit()

      await handleApplianceApplicationDetailsRequest(
        { params: { applianceId: 'APP-1' } },
        h
      )

      const [, viewModel] = h.view.mock.calls[0]
      expect(viewModel.summaryRows).toHaveLength(2)
    })

    test('renders linked legacy applications as plain text for a single ID', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({ data: legacyApplication })
      const h = toolkit()

      await handleApplianceApplicationDetailsRequest(
        { params: { applianceId: 'APP-1' } },
        h
      )

      const [, viewModel] = h.view.mock.calls[0]
      const linkedRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Linked legacy applications'
      )
      expect(linkedRow.value.text).toBe('CAA-EA-00000850')
      expect(linkedRow.value.html).toBeUndefined()
    })

    test('renders linked legacy applications as a bullet list for multiple IDs', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({
        data: {
          ...legacyApplication,
          legacy: {
            linkedApplicationIds: ['CAA-EA-00000850', 'CAA-EA-00000851']
          }
        }
      })
      const h = toolkit()

      await handleApplianceApplicationDetailsRequest(
        { params: { applianceId: 'APP-1' } },
        h
      )

      const [, viewModel] = h.view.mock.calls[0]
      const linkedRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Linked legacy applications'
      )
      expect(linkedRow.value.html).toContain('<li>CAA-EA-00000850</li>')
      expect(linkedRow.value.html).toContain('<li>CAA-EA-00000851</li>')
      expect(linkedRow.value.text).toBeUndefined()
    })

    test('renders "Not provided" when linkedApplicationIds is absent', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({
        data: { ...legacyApplication, legacy: undefined }
      })
      const h = toolkit()

      await handleApplianceApplicationDetailsRequest(
        { params: { applianceId: 'APP-1' } },
        h
      )

      const [, viewModel] = h.view.mock.calls[0]
      const linkedRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Linked legacy applications'
      )
      expect(linkedRow.value.text).toBe('Not provided')
    })

    test('renders company name and address combined in the Company row', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({ data: legacyApplication })
      const h = toolkit()

      await handleApplianceApplicationDetailsRequest(
        { params: { applianceId: 'APP-1' } },
        h
      )

      const [, viewModel] = h.view.mock.calls[0]
      const companyRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Company'
      )
      expect(companyRow.value.html).toContain('Jetmaster Fires Limited')
      expect(companyRow.value.html).toContain('Unit 2')
      expect(companyRow.value.html).toContain('SO50 4NT')
    })
  })

  test('renders error page when the technical review fetch fails', async () => {
    getApplianceTechnicalReviewMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the application fetch fails', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockRejectedValue(new Error('not found'))
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
