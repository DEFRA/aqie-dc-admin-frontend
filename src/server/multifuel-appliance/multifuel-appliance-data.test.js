import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getApplianceTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getApplianceTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

vi.mock('../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

const { getApplianceForMultifuel, saveMultifuelAppliance } =
  await import('./multifuel-appliance-data.js')

describe('#getApplianceForMultifuel', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared appliance technical review fetch helper', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForMultifuel('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#saveMultifuelAppliance', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('patches /appliances/{id} with multifuelAppliance as true', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveMultifuelAppliance('APP-1', true)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      multifuelAppliance: true
    })
  })

  test('patches /appliances/{id} with multifuelAppliance as false', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveMultifuelAppliance('APP-1', false)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      multifuelAppliance: false
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveMultifuelAppliance('APP/1', true)

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      multifuelAppliance: true
    })
  })
})
