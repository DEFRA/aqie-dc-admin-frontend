import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../../common/constants/status-codes.js'
import { handleApplianceRecordInstructionManualRequest } from './controller.js'

const { getApplianceForInstructionManualMock } = vi.hoisted(() => ({
  getApplianceForInstructionManualMock: vi.fn()
}))

vi.mock('./appliance-record-instruction-manual-data.js', () => ({
  getApplianceForInstructionManual: getApplianceForInstructionManualMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
  isLegacyRecord: false,
  instructionManual: {
    title: 'Aarrow Ecoburn manual',
    version: '2.0',
    publicationDate: '2019-01-10T00:00:00.000Z'
  }
}

const legacyAppliance = {
  ...baseAppliance,
  isLegacyRecord: true,
  servicingManual: {
    title: 'Installation, Operating and Servicing Instructions',
    version: 'Part No.107135 Issue No.12',
    publicationDate: '2016-03-01T00:00:00.000Z'
  }
}

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleApplianceRecordInstructionManualRequest', () => {
  beforeEach(() => {
    getApplianceForInstructionManualMock.mockReset()
  })

  test('renders with "Instruction manual for {modelName}" heading for non-legacy', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: baseAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/instruction-manual/index',
      expect.objectContaining({
        heading:
          'Instruction manual for Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        pageTitle:
          'Instruction manual for Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove'
      })
    )
  })

  test('renders with "Manuals for {modelName}" heading for legacy', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: legacyAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.heading).toBe(
      'Manuals for Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove'
    )
  })

  test('non-legacy: builds 3 instruction manual rows with formatted date', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: baseAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.instructionManualRows).toHaveLength(3)
    expect(viewModel.instructionManualRows[0].value.text).toBe(
      'Aarrow Ecoburn manual'
    )
    expect(viewModel.instructionManualRows[1].value.text).toBe('2.0')
    expect(viewModel.instructionManualRows[2].value.text).toBe(
      '10 January 2019'
    )
  })

  test('non-legacy: servicingManualRows is empty', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: baseAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.servicingManualRows).toHaveLength(0)
    expect(viewModel.isLegacyRecord).toBe(false)
  })

  test('non-legacy: missing instructionManual fields fall back to "Not provided"', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: { ...baseAppliance, instructionManual: undefined }
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    for (const row of viewModel.instructionManualRows) {
      expect(row.value.text).toBe('Not provided')
    }
  })

  test('legacy: builds 3 servicing manual rows with formatted date', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: legacyAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.servicingManualRows).toHaveLength(3)
    expect(viewModel.servicingManualRows[0].value.text).toBe(
      'Installation, Operating and Servicing Instructions'
    )
    expect(viewModel.servicingManualRows[1].value.text).toBe(
      'Part No.107135 Issue No.12'
    )
    expect(viewModel.servicingManualRows[2].value.text).toBe('1 March 2016')
    expect(viewModel.isLegacyRecord).toBe(true)
  })

  test('legacy: missing servicingManual fields fall back to "Not available"', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: { ...legacyAppliance, servicingManual: undefined }
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    const [, viewModel] = h.view.mock.calls[0]
    for (const row of viewModel.servicingManualRows) {
      expect(row.value.text).toBe('Not available')
    }
  })

  test('sets correct back link, return href, and breadcrumbs', async () => {
    getApplianceForInstructionManualMock.mockResolvedValue({
      data: baseAppliance
    })
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

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

  test('renders error page when the API fetch fails', async () => {
    getApplianceForInstructionManualMock.mockRejectedValue(
      new Error('backend down')
    )
    const h = toolkit()

    await handleApplianceRecordInstructionManualRequest(
      { params: { applianceId: 'APP-1' } },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
