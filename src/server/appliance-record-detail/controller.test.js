import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { handleApplianceRecordDetailRequest } from './controller.js'

const { getApplianceDetailMock } = vi.hoisted(() => ({
  getApplianceDetailMock: vi.fn()
}))

vi.mock('./appliance-record-detail-data.js', () => ({
  getApplianceDetail: getApplianceDetailMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Model X',
  modelNumber: '123',
  applianceType: 'heat',
  isVariant: false,
  nominalOutput: 10,
  multifuelAppliance: false,
  permittedFuels: 'Wood logs',
  additionalConditions: 'Some conditions',
  isLegacyRecord: false
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')

  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleApplianceRecordDetailRequest', () => {
  beforeEach(() => {
    getApplianceDetailMock.mockReset()
  })

  test('renders the appliance details page with heading', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record-detail/index',
      expect.objectContaining({
        heading: 'Appliance details',
        pageTitle: 'Appliance details'
      })
    )
  })

  test('non-legacy view builds 8 rows by default', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(8)
    expect(viewModel.summaryRows[0].key.text).toBe('Appliance ID')
    expect(viewModel.summaryRows[0].value.text).toBe('APP-1')
  })

  test('non-legacy view formats nominal output with kW', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const outputRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Nominal (thermal) output'
    )
    expect(outputRow.value.text).toBe('10 kW')
  })

  test('non-legacy: single permitted fuel renders as plain text', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const fuelsRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Permitted fuels'
    )
    expect(fuelsRow.value.text).toBe('Wood logs')
    expect(fuelsRow.value.html).toBeUndefined()
  })

  test('non-legacy: multiple permitted fuels renders as bullet list', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        permittedFuels: ['Wood logs', 'Wood pellets', 'Wood chips']
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const fuelsRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Permitted fuels'
    )
    expect(fuelsRow.value.html).toContain('<ul')
    expect(fuelsRow.value.html).toContain('<li>Wood logs</li>')
    expect(fuelsRow.value.html).toContain('<li>Wood pellets</li>')
    expect(fuelsRow.value.html).toContain('<li>Wood chips</li>')
    expect(fuelsRow.value.text).toBeUndefined()
  })

  test('non-legacy: adds Other appliance type row when applianceType is other', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        applianceType: 'other',
        otherApplianceType: 'Incinerator'
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(9)
    const otherTypeRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Other appliance type'
    )
    expect(otherTypeRow).toBeDefined()
    expect(otherTypeRow.value.text).toBe('Incinerator')
  })

  test('non-legacy: adds Variant details row when isVariant is true', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        isVariant: true,
        existingAuthorisedAppliance: 'Aarrow I Series 500'
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(9)
    const variantRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Variant details'
    )
    expect(variantRow).toBeDefined()
    expect(variantRow.value.text).toBe('Aarrow I Series 500')
  })

  test('legacy view uses Legacy appliance ID label and omits Appliance ID', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        isLegacyRecord: true,
        permittedToBurnWood: true
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows[0].key.text).toBe('Legacy appliance ID')
    expect(viewModel.summaryRows[0].value.text).toBe('APP-1')
    const hasApplianceId = viewModel.summaryRows.some(
      (row) => row.key.text === 'Appliance ID'
    )
    expect(hasApplianceId).toBe(false)
  })

  test('legacy view builds 9 rows with multifuel and burn wood fields', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        isLegacyRecord: true,
        multifuelAppliance: false,
        permittedToBurnWood: true
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.summaryRows).toHaveLength(9)
    const multifuelRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Is it a multifuel appliance?'
    )
    const burnWoodRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Is this appliance permitted to burn wood?'
    )
    expect(multifuelRow.value.text).toBe('No')
    expect(burnWoodRow.value.text).toBe('Yes')
  })

  test('legacy: single permitted fuel renders as plain text', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        isLegacyRecord: true,
        permittedToBurnWood: true
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const fuelsRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Permitted fuels'
    )
    expect(fuelsRow.value.text).toBe('Wood logs')
    expect(fuelsRow.value.html).toBeUndefined()
  })

  test('legacy: multiple permitted fuels renders as bullet list', async () => {
    getApplianceDetailMock.mockResolvedValue({
      data: {
        ...baseAppliance,
        isLegacyRecord: true,
        permittedFuels: ['Wood logs', 'Wood pellets'],
        permittedToBurnWood: true
      }
    })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    const fuelsRow = viewModel.summaryRows.find(
      (row) => row.key.text === 'Permitted fuels'
    )
    expect(fuelsRow.value.html).toContain('<li>Wood logs</li>')
    expect(fuelsRow.value.html).toContain('<li>Wood pellets</li>')
  })

  test('sets correct back link and return href from applianceId', async () => {
    getApplianceDetailMock.mockResolvedValue({ data: baseAppliance })
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.backLink.href).toBe(
      '/manage-certification/appliance-record/APP-1'
    )
    expect(viewModel.returnHref).toBe(
      '/manage-certification/appliance-record/APP-1'
    )
  })

  test('renders error page when API fetch fails', async () => {
    getApplianceDetailMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleApplianceRecordDetailRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
