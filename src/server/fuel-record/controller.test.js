import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

const { getFuelRecordMock } = vi.hoisted(() => ({
  getFuelRecordMock: vi.fn()
}))

vi.mock('./fuel-record-data.js', () => ({
  getFuelRecord: getFuelRecordMock
}))

const cert = (status, firstCertifiedAt = null) => ({ status, firstCertifiedAt })

const certifiedExceptScotland = {
  england: cert('certified', '2025-05-10'),
  scotland: cert('uncertified'),
  wales: cert('certified', '2025-05-25'),
  northernIreland: cert('certified', '2025-05-15')
}

const allCountries = (status) => ({
  england: cert(status),
  scotland: cert(status),
  wales: cert(status),
  northernIreland: cert(status)
})

const backendFuel = (overrides) => ({
  success: true,
  data: {
    id: '7756-0101',
    name: 'Cosytherm Briquettes',
    applicationId: '7756-0307',
    supplierType: 'Manufacture',
    status: 'live',
    certifications: certifiedExceptScotland,
    canTogglePublicVisibility: true,
    isVisibleToPublic: true,
    isLegacyRecord: false,
    ...overrides
  }
})

describe('#fuelRecord controller', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    getFuelRecordMock.mockReset()
  })

  const get = (id = '7756-0101') =>
    server.inject({ method: 'GET', url: `/fuel-record/${id}` })

  test('AC1/AC2/AC4 renders a live Manufacture fuel record', async () => {
    getFuelRecordMock.mockResolvedValue(backendFuel())

    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(getFuelRecordMock).toHaveBeenCalledWith('7756-0101')
    expect(result).toContain('Live on public list')
    expect(result).toContain('govuk-tag--green')
    expect(result).toContain('Cosytherm Briquettes')
    expect(result).toContain('href="/fuel-list/7756-0101"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('Hide fuel from public list')
    expect(result).not.toContain('Make fuel live on public list')
    expect(result).toContain('10 May 2025')
    expect(result).toContain('Not certified')
    expect(result).toContain(
      'href="/fuel-record/7756-0101/approval-status-northern-ireland"'
    )
    expect(result).toContain(
      'Change<span class="govuk-visually-hidden"> certification status for Northern Ireland</span>'
    )
    expect(result).not.toContain('Update')
    expect(result).toContain('Test results')
    expect(result).toContain('Application 0307 details - Manufacturer')
    expect(result).toContain('href="/fuel-record/7756-0101/action-history"')
    expect(result).toContain('Return to fuel records')
    expect(result).toContain('href="/fuel-records"')
    expect(result).not.toContain('Date last certified')
  })

  test('AC5 renders a fuel hidden by HETAS with a make live button', async () => {
    getFuelRecordMock.mockResolvedValue(
      backendFuel({ status: 'hidden', isVisibleToPublic: false })
    )

    const { result } = await get()

    expect(result).toContain('Hidden from public list')
    expect(result).toContain('Make fuel live on public list')
    expect(result).toContain(
      'href="/fuel-record/7756-0101/change-display-status"'
    )
    expect(result).not.toContain('Hide fuel from public list')
    expect(result).not.toContain('View public listing')
  })

  test('AC6 renders a hidden uncertified Rebrand fuel with no button', async () => {
    getFuelRecordMock.mockResolvedValue(
      backendFuel({
        name: 'Coalfire Plus',
        applicationId: '7756-0248',
        supplierType: 'Rebrand',
        status: 'hidden',
        certifications: allCountries('uncertified'),
        canTogglePublicVisibility: false
      })
    )

    const { result } = await get()

    expect(result).toContain('Hidden from public list')
    expect(result).toContain('Application 0248 details - Rebrander')
    expect(result).not.toContain('Test results')
    expect(result).not.toContain('Make fuel live on public list')
    expect(result).not.toContain('Hide fuel from public list')
  })

  test('AC3 renders a pending fuel with no button', async () => {
    getFuelRecordMock.mockResolvedValue(
      backendFuel({
        name: 'Centra Firelog',
        supplierType: 'Rebrand',
        status: 'pending',
        certifications: allCountries('awaiting_decision'),
        canTogglePublicVisibility: false
      })
    )

    const { result } = await get()

    expect(result).toContain('Pending government approval')
    expect(result).toContain('Awaiting decision')
    expect(result).toContain('govuk-tag--yellow')
    expect(result).not.toContain('View public listing')
    expect(result).not.toContain('govuk-button-group')
  })

  test('renders the not found page when the backend returns 404', async () => {
    const error = new Error('Backend GET failed: 404')
    error.status = statusCodes.notFound
    getFuelRecordMock.mockRejectedValue(error)

    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.notFound)
    expect(result).toContain('Fuel record not found')
  })

  test('renders the not found page when the backend resolves notFound', async () => {
    getFuelRecordMock.mockResolvedValue({
      success: false,
      message: 'Fuel not found',
      notFound: true
    })

    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.notFound)
    expect(result).toContain('Fuel record not found')
  })

  test('renders the generic error page when the backend fails', async () => {
    getFuelRecordMock.mockRejectedValue(new Error('boom'))

    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.internalServerError)
    expect(result).toContain('Sorry, there is a problem with the service')
  })

  test('renders the generic error page when the backend reports failure', async () => {
    getFuelRecordMock.mockResolvedValue({ success: false, message: 'nope' })

    const { statusCode } = await get()

    expect(statusCode).toBe(statusCodes.internalServerError)
  })

  test('rejects an invalid fuel id', async () => {
    const { statusCode } = await get('bad$id')

    expect(statusCode).toBe(statusCodes.badRequest)
    expect(getFuelRecordMock).not.toHaveBeenCalled()
  })
})
