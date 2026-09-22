import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getApplianceTechnicalReviewMock, patchJsonMock } = vi.hoisted(() => ({
  getApplianceTechnicalReviewMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  patchJson: patchJsonMock
}))

vi.mock('../common/services/commonService.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

const { getApplianceForPermittedFuels, savePermittedFuels } =
  await import('./check-permitted-fuels-data.js')

describe('#getApplianceForPermittedFuels', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches from /appliances/{id}/technical-review', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ success: true })

    await getApplianceForPermittedFuels('APP-1')

    expect(getApplianceTechnicalReviewMock).toHaveBeenCalledWith('APP-1')
  })
})

describe('#savePermittedFuels', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('saves permitted fuels values with a single backend patch', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await savePermittedFuels('APP-1', 'Wood logs', true)

    expect(patchJsonMock).toHaveBeenCalledTimes(1)
    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review/checks',
      {
        check: 'permittedFuels',
        result: true,
        data: {
          permittedFuels: 'Wood logs',
          isPermittedToBurnWood: true
        }
      }
    )
  })

  test('encodes appliance id in both requests', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await savePermittedFuels('APP/1', 'Wood logs', false)

    expect(patchJsonMock).toHaveBeenCalledTimes(1)
    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1/technical-review/checks',
      {
        check: 'permittedFuels',
        result: true,
        data: {
          permittedFuels: 'Wood logs',
          isPermittedToBurnWood: false
        }
      }
    )
  })
})
