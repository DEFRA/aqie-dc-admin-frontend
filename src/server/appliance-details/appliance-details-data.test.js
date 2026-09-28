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

const { getApplianceForCheckDetails, markApplianceDetailsCompleted } =
  await import('./appliance-details-data.js')

describe('#getApplianceForCheckDetails', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('uses the shared appliance technical review fetch helper', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForCheckDetails('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#markApplianceDetailsCompleted', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('marks appliance details check as complete', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await markApplianceDetailsCompleted('APP-1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      {
        check: 'applianceDetails',
        result: true
      }
    )
  })

  test('encodes appliance id in patch request', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await markApplianceDetailsCompleted('APP/1')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review/checks',
      {
        check: 'applianceDetails',
        result: true
      }
    )
  })
})
