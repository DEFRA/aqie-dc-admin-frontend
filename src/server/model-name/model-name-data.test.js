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

const { getApplianceForModelName, saveModelName } =
  await import('./model-name-data.js')

describe('#getApplianceForModelName', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared appliance technical review fetch helper', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForModelName('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#saveModelName', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('updates the appliance model name', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelName('APP-1', 'Twin Heat M40i Pro')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP-1', {
      modelName: 'Twin Heat M40i Pro'
    })
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveModelName('APP/1', 'Variant')

    expect(patchJsonMock).toHaveBeenCalledWith('/appliances/APP%2F1', {
      modelName: 'Variant'
    })
  })
})
