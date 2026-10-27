import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../../common/constants/status-codes.js'
import { handleApplianceApplicationDetailsRequest } from './controller.js'

const { getApplianceTechnicalReviewMock, getApplicationDetailsMock } =
  vi.hoisted(() => ({
    getApplianceTechnicalReviewMock: vi.fn(),
    getApplicationDetailsMock: vi.fn()
  }))

vi.mock('../../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

vi.mock('./appliance-application-details-data.js', () => ({
  getApplicationDetails: getApplicationDetailsMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F',
  applicationId: 'app-uuid-123',
  companyName: 'Arada Limited',
  companyFullAddress:
    'The Fireworks\nWeycroft Avenue\nAxminster\nDevon\nEX13 5HU',
  companyContact: {
    name: 'John Doe',
    email: 'john.doe@arada.co.uk',
    alternativeEmail: 'hello@arada.co.uk',
    phone: '07722 334455'
  }
}

const baseApplication = {
  id: 'app-uuid-123',
  submittedAt: '2026-01-01T00:00:00.000Z',
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
      'appliance-record/application-details/index',
      expect.objectContaining({
        pageTitle: 'Application app-uuid-123 details',
        heading: 'Application app-uuid-123 details'
      })
    )
  })
  test('strips the 4-digit prefix from the applicationId in the title and heading', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: { ...baseApplication, id: '7756-0001' }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/application-details/index',
      expect.objectContaining({
        pageTitle: 'Application 0001 details',
        heading: 'Application 0001 details'
      })
    )
  })
  test('renders "Application details" as title when application.id is absent', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: { ...baseApplication, id: undefined }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/application-details/index',
      expect.objectContaining({
        pageTitle: 'Application details',
        heading: 'Application details'
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

  test('reads company and contact details from the appliance, not the application', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const valueFor = (label) =>
      viewModel.summaryRows.find((row) => row.key.text === label).value.text

    expect(valueFor('Company name')).toBe('Arada Limited')
    expect(valueFor('Main contact name')).toBe('John Doe')
    expect(valueFor('Main contact email')).toBe('john.doe@arada.co.uk')
    expect(valueFor('Main contact alternative email')).toBe('hello@arada.co.uk')
    expect(valueFor('Main contact telephone number')).toBe('07722 334455')
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
    getApplianceTechnicalReviewMock.mockResolvedValue({
      data: {
        ...baseAppliance,
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
    getApplianceTechnicalReviewMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        companyContact: {
          ...baseAppliance.companyContact,
          alternativeEmail: undefined
        }
      }
    })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
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
    getApplianceTechnicalReviewMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        companyContact: {
          ...baseAppliance.companyContact,
          phone: undefined
        }
      }
    })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
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

  test('skips the application fetch and renders with empty data when applicationId is absent', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({
      data: { ...baseAppliance, applicationId: undefined }
    })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplicationDetailsMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/application-details/index',
      expect.objectContaining({
        pageTitle: 'Application details',
        heading: 'Application details'
      })
    )
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

  test('uses legacy.applicationId for legacy appliances instead of applicationId', async () => {
    const legacyAppliance = {
      ...baseAppliance,
      isLegacyRecord: true,
      applicationId: null,
      legacy: { applicationId: 'legacy-app-uuid-456' }
    }
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: legacyAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplicationDetailsMock).toHaveBeenCalledWith(
      'legacy-app-uuid-456'
    )
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
    const legacyAppliance = {
      ...baseAppliance,
      isLegacyRecord: true,
      legacy: { applicationId: 'app-uuid-123' },
      companyName: 'Jetmaster Fires Limited',
      companyFullAddress: undefined,
      companyAddress: {
        line1: 'Unit 2',
        line2: 'Peacock Trading Estate',
        city: 'Eastleigh',
        county: 'Hampshire',
        postcode: 'SO50 4NT'
      }
    }

    const legacyApplication = {
      id: 'app-uuid-123',
      legacy: {
        linkedApplicationIds: ['CAA-EA-00000850']
      }
    }

    test('renders 3 summary rows for a legacy record with address present', async () => {
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
      expect(viewModel.summaryRows).toHaveLength(3)
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

    test('renders linked legacy applications as comma-separated with "and" for multiple IDs', async () => {
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
      expect(linkedRow.value.text).toBe('CAA-EA-00000850 and CAA-EA-00000851')
      expect(linkedRow.value.html).toBeUndefined()
    })

    test('renders linked legacy applications with commas for three or more IDs', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: legacyAppliance
      })
      getApplicationDetailsMock.mockResolvedValue({
        data: {
          ...legacyApplication,
          legacy: {
            linkedApplicationIds: [
              'CAA-EA-00000850',
              'CAA-EA-00000851',
              'CAA-EA-00000852'
            ]
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
      expect(linkedRow.value.text).toBe(
        'CAA-EA-00000850, CAA-EA-00000851 and CAA-EA-00000852'
      )
    })

    test('omits the linked legacy applications row when linkedApplicationIds is absent', async () => {
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
      expect(linkedRow).toBeUndefined()
      expect(viewModel.summaryRows).toHaveLength(2)
    })

    test('renders separate Company name and Company address rows when address is present', async () => {
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
      const nameRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Company name'
      )
      const addressRow = viewModel.summaryRows.find(
        (row) => row.key.text === 'Company address'
      )
      expect(nameRow.value.text).toBe('Jetmaster Fires Limited')
      expect(addressRow.value.html).toContain('Unit 2')
      expect(addressRow.value.html).toContain('SO50 4NT')
    })

    test('renders single Company row with name only when address is absent', async () => {
      getApplianceTechnicalReviewMock.mockResolvedValue({
        data: {
          ...legacyAppliance,
          companyAddress: undefined,
          companyFullAddress: undefined
        }
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
      expect(companyRow.value.text).toBe('Jetmaster Fires Limited')
      expect(
        viewModel.summaryRows.find((row) => row.key.text === 'Company name')
      ).toBeUndefined()
      expect(
        viewModel.summaryRows.find((row) => row.key.text === 'Company address')
      ).toBeUndefined()
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
