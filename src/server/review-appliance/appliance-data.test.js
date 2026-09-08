import { vi } from 'vitest'

const { fetchJsonMock, patchJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  patchJsonMock: vi.fn()
}))

vi.mock('../common/api/api.js', () => ({
  fetchJson: fetchJsonMock,
  patchJson: patchJsonMock
}))

const { getApplianceReview, saveApplianceReview } =
  await import('./appliance-data.js')

describe('#applianceReviewData', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset()
    patchJsonMock.mockReset()
  })

  test('fetches from /appliances/{id}/technical-review', async () => {
    fetchJsonMock.mockResolvedValue({ data: { id: 'APP-1' } })

    const result = await getApplianceReview('APP-1')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review'
    )
    expect(result.data.id).toBe('APP-1')
  })

  test('encodes the appliance id in the path', async () => {
    fetchJsonMock.mockResolvedValue({})

    await getApplianceReview('APP/1 2')

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP%2F1%202/technical-review'
    )
  })

  test('patches the decision with the reviewer', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveApplianceReview('APP-1', 'accepted', {
      name: 'A Reviewer',
      email: 'a@defra.gov.uk'
    })

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review',
      {
        status: 'accepted',
        reviewedBy: { name: 'A Reviewer', email: 'a@defra.gov.uk' }
      }
    )
  })

  test('omits reviewedBy when nobody is signed in', async () => {
    patchJsonMock.mockResolvedValue({ success: true })

    await saveApplianceReview('APP-1', 'rejected')

    expect(patchJsonMock).toHaveBeenCalledWith(
      '/appliances/APP-1/technical-review',
      { status: 'rejected' }
    )
  })
})
