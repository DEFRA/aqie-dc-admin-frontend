import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../../common/constants/status-codes.js'
import { handleTestReportsRequest } from './controller.js'

const { getTestReportsMock } = vi.hoisted(() => ({
  getTestReportsMock: vi.fn()
}))

vi.mock('./test-reports-data.js', () => ({
  getTestReports: getTestReportsMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
  testResults: {
    ratedOutput: 5,
    testedOutput: { rated: 5, low: 3 },
    smokeEmissionOutput: { rated: 3, low: 1 }
  }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleTestReportsRequest', () => {
  beforeEach(() => {
    getTestReportsMock.mockReset()
  })

  test('renders with correct heading including model name', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/test-reports/index',
      expect.objectContaining({
        heading:
          'Test results for Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        pageTitle:
          'Test results for Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove'
      })
    )
  })

  test('builds 5 summary rows', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(5)
  })

  test('formats kW values correctly', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[0].value.text).toBe('5 kW')
    expect(viewModel.summaryRows[1].value.text).toBe('5 kW')
    expect(viewModel.summaryRows[2].value.text).toBe('3 kW')
  })

  test('formats smoke emission with plural "grams per hour" for value > 1', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[3].value.text).toBe('3 grams per hour')
  })

  test('formats smoke emission with singular "gram per hour" for value of 1', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[4].value.text).toBe('1 gram per hour')
  })

  test('falls back to "Not provided" when testResults is absent', async () => {
    getTestReportsMock.mockResolvedValue({
      data: { ...baseAppliance, testResults: undefined }
    })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    for (const row of viewModel.summaryRows) {
      expect(row.value.text).toBe('Not provided')
    }
  })

  test('falls back to "Not provided" for individual absent nested fields', async () => {
    getTestReportsMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        testResults: {
          ratedOutput: 5,
          testedOutput: undefined,
          smokeEmissionOutput: undefined
        }
      }
    })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[1].value.text).toBe('Not provided')
    expect(viewModel.summaryRows[2].value.text).toBe('Not provided')
    expect(viewModel.summaryRows[3].value.text).toBe('Not provided')
    expect(viewModel.summaryRows[4].value.text).toBe('Not provided')
  })

  test('sets correct back link, return href, and breadcrumbs', async () => {
    getTestReportsMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.backLink.href).toBe('/appliance-record/APP-1')
    expect(viewModel.returnHref).toBe('/appliance-record/APP-1')
    expect(viewModel.breadcrumbs).toEqual([
      { text: 'Home', href: '/manage-certification' },
      { text: 'Appliance records', href: '/appliance-records' },
      {
        text: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        href: '/appliance-record/APP-1'
      }
    ])
  })

  test('renders error page when API fetch fails', async () => {
    getTestReportsMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleTestReportsRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
