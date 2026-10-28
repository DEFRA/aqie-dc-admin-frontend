import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../../common/constants/status-codes.js'
import { handleApplianceApplicationDetailsRequest } from './controller.js'

const { getApplianceDetailMock, getApplicationDetailsMock } = vi.hoisted(
  () => ({
    getApplianceDetailMock: vi.fn(),
    getApplicationDetailsMock: vi.fn()
  })
)

vi.mock('./appliance-application-details-data.js', () => ({
  getApplianceDetail: getApplianceDetailMock,
  getApplicationDetails: getApplicationDetailsMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F',
  applicationId: 'app-uuid-123',
  companyName: 'Arada Limited',
  fullAddress: 'The Fireworks\nWeycroft Avenue\nAxminster\nDevon\nEX13 5HU',
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
    getApplianceDetailMock.mockReset()
    getApplicationDetailsMock.mockReset()
  })

  test('fetches the appliance by the route applianceId', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplianceDetailMock).toHaveBeenCalledWith('APP-1')
  })

  test('renders the page with heading and title including the applicationId', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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

  test('leaves the application date empty when submittedAt is absent', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    expect(dateRow.value.text).toBeUndefined()
  })

  test('reads company and contact details from the appliance, not the application', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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

  test('builds company address from fullAddress splitting on newlines', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    expect(addressRow.value.html).toBe(
      'The Fireworks<br>Weycroft Avenue<br>Axminster<br>Devon<br>EX13 5HU'
    )
  })

  test('trims address lines and drops blank lines', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        fullAddress: '  456 Factory Road  \n\n Birmingham \n  \nB1 2AB'
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
    expect(addressRow.value.html).toBe(
      '456 Factory Road<br>Birmingham<br>B1 2AB'
    )
  })

  test('escapes HTML in address lines', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        fullAddress: 'Smith & Sons\n<script>alert(1)</script>'
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
    expect(addressRow.value.html).toBe(
      'Smith &amp; Sons<br>&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })

  test('renders an empty company address when fullAddress is absent', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: { ...baseAppliance, fullAddress: undefined }
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
    expect(addressRow.value.html).toBe('')
    expect(addressRow.value.text).toBeUndefined()
  })

  test('renders linkedItems as a govuk bullet list', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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

  test('escapes HTML in linkedItems model names', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    getApplicationDetailsMock.mockResolvedValue({
      data: {
        ...baseApplication,
        linkedItems: [{ modelName: 'Stove <b>&</b> "Pro"' }]
      }
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
    expect(appliancesRow.value.html).toContain(
      '<li>Stove &lt;b&gt;&amp;&lt;/b&gt; &quot;Pro&quot;</li>'
    )
    expect(appliancesRow.value.html).not.toContain('<b>')
  })

  test('renders an empty bullet list when linkedItems is empty', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    expect(appliancesRow.value.html).toBe(
      '<ul class="govuk-list govuk-list--bullet"></ul>'
    )
    expect(appliancesRow.value.text).toBeUndefined()
  })

  test('leaves alternativeEmail empty when missing', async () => {
    getApplianceDetailMock.mockResolvedValue({
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
    expect(altEmailRow.value.text).toBeUndefined()
  })

  test('leaves phone empty when missing', async () => {
    getApplianceDetailMock.mockResolvedValue({
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
    expect(phoneRow.value.text).toBeUndefined()
  })

  test('leaves contact fields empty when companyContact is absent', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: { ...baseAppliance, companyContact: undefined }
    })
    getApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const valueFor = (label) =>
      viewModel.summaryRows.find((row) => row.key.text === label).value.text

    expect(valueFor('Main contact name')).toBeUndefined()
    expect(valueFor('Main contact email')).toBeUndefined()
    expect(valueFor('Main contact alternative email')).toBeUndefined()
    expect(valueFor('Main contact telephone number')).toBeUndefined()
  })

  test('skips the application fetch and renders with empty data when applicationId is absent', async () => {
    getApplianceDetailMock.mockResolvedValue({
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

  test('uses applicationId from the appliance response to fetch the application', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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
      fullAddress:
        'Unit 2\nPeacock Trading Estate\nEastleigh\nHampshire\nSO50 4NT'
    }

    const legacyApplication = {
      id: 'app-uuid-123',
      legacy: {
        linkedApplicationIds: ['CAA-EA-00000850']
      }
    }

    test('renders 3 summary rows for a legacy record with address present', async () => {
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({ data: legacyAppliance })
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
      getApplianceDetailMock.mockResolvedValue({
        data: {
          ...legacyAppliance,
          fullAddress: undefined
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

  test('renders error page when the appliance detail fetch fails', async () => {
    getApplianceDetailMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceApplicationDetailsRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(getApplicationDetailsMock).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the application fetch fails', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
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