import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../../common/constants/status-codes.js'
import { handleLegacyCommentsRequest } from './controller.js'

const { getApplianceTechnicalReviewMock, getLegacyCommentsMock } = vi.hoisted(
  () => ({
    getApplianceTechnicalReviewMock: vi.fn(),
    getLegacyCommentsMock: vi.fn()
  })
)

vi.mock('../../common/services/common-appliance-service.js', () => ({
  getApplianceTechnicalReview: getApplianceTechnicalReviewMock
}))

vi.mock('./legacy-comments-data.js', () => ({
  getLegacyComments: getLegacyCommentsMock
}))

const baseAppliance = {
  id: 'APP-1',
  modelName: 'Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove'
}

const baseComments = [
  '[05/04/2016 12:16] Data Entry User / Data Entry (Legacy.user@example.com): The Jetmaster 50i comment.',
  '[08/06/2016 14:45] Data Entry User / Data Entry (Legacy.user@example.com): According to the applicant...'
]

function toolkit() {
  const code = vi.fn().mockReturnValue('rendered')
  return {
    view: vi.fn().mockReturnValue({ code }),
    code
  }
}

describe('#handleLegacyCommentsRequest', () => {
  beforeEach(() => {
    getApplianceTechnicalReviewMock.mockReset()
    getLegacyCommentsMock.mockReset()
  })

  test('renders with correct heading including model name', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({ data: baseComments })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith(
      'appliance-record/legacy-comments/index',
      expect.objectContaining({
        heading:
          'Legacy comments on Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove',
        pageTitle:
          'Legacy comments on Aarrow Ecoburn 5F plus Widescreen 4.99kW multi-fuel stove'
      })
    )
  })

  test('passes all comments to the view model', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({ data: baseComments })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.comments).toHaveLength(2)
  })

  test('passes string comments through unchanged', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({ data: baseComments })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.comments[0]).toBe(
      '[05/04/2016 12:16] Data Entry User / Data Entry (Legacy.user@example.com): The Jetmaster 50i comment.'
    )
  })

  test('normalizes structured comment objects into formatted strings', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({
      data: [
        {
          date: '05/04/2016 12:16',
          user: 'Data Entry User',
          role: 'Data Entry',
          email: 'Legacy.user@example.com',
          text: 'The Jetmaster 50i comment.'
        }
      ]
    })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.comments[0]).toBe(
      '[05/04/2016 12:16] Data Entry User / Data Entry (Legacy.user@example.com): The Jetmaster 50i comment.'
    )
  })

  test('comments is empty array when response data is empty', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({ data: [] })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    const [, viewModel] = h.view.mock.calls[0]
    expect(viewModel.comments).toHaveLength(0)
  })

  test('sets correct back link, return href, and breadcrumbs', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockResolvedValue({ data: baseComments })
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

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

  test('renders error page when the technical review fetch fails', async () => {
    getApplianceTechnicalReviewMock.mockRejectedValue(new Error('backend down'))
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  test('renders error page when the comments fetch fails', async () => {
    getApplianceTechnicalReviewMock.mockResolvedValue({ data: baseAppliance })
    getLegacyCommentsMock.mockRejectedValue(new Error('not found'))
    const h = toolkit()

    await handleLegacyCommentsRequest({ params: { applianceId: 'APP-1' } }, h)

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })
    expect(h.code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})
