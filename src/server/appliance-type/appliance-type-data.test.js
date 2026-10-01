import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getApplianceTechnicalReviewMock, patchJsonMock, fetchJsonMock } =
  vi.hoisted(() => ({
    getApplianceTechnicalReviewMock: vi.fn(),
    patchJsonMock: vi.fn(),
    fetchJsonMock: vi.fn()
  }))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock,
  fetchJson: fetchJsonMock
}))

vi.mock('../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

const { getApplianceForApplianceType, saveApplianceType } =
  await import('./appliance-type-data.js')

describe('#getApplianceForApplianceType', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches the appliance from the technical review endpoint', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForApplianceType('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#saveApplianceType', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the appliance with appliance type', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveApplianceType('APP-1', 'Boiler')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      applianceType: 'Boiler'
    })
  })

  test('saves Other as appliance type', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveApplianceType('APP-1', 'Other')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      applianceType: 'Other'
    })
  })

  test('encodes special characters in appliance ID', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveApplianceType('APP/001', 'Stove')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F001', {
      applianceType: 'Stove'
    })
  })
})

describe('#getApplianceTypes', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
  })

  test('fetches primary appliance types when isPrimary is true', async () => {
    const mockTypes = [
      { value: 'Stove', isPrimary: true },
      { value: 'Boiler', isPrimary: true }
    ]
    fetchJsonMock.mockResolvedValue(mockTypes)

    const result = await (
      await import('./appliance-type-data.js')
    ).getApplianceTypes(true)

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliance-types?isPrimary=true'
    )
    expect(result).toEqual(mockTypes)
  })

  test('fetches secondary appliance types when isPrimary is false', async () => {
    const mockTypes = [
      { value: 'Air heater', isPrimary: false },
      { value: 'Gasifier', isPrimary: false }
    ]
    fetchJsonMock.mockResolvedValue(mockTypes)

    const result = await (
      await import('./appliance-type-data.js')
    ).getApplianceTypes(false)

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliance-types?isPrimary=false'
    )
    expect(result).toEqual(mockTypes)
  })
})
