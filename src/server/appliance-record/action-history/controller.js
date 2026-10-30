import { actionHistoryContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceActionHistory } from './action-history-data.js'
import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { buildPaginationConfig } from '../../common/helpers/pagination-builder.js'

const logger = createLogger()
const content = actionHistoryContent.en

const DATE_FORMAT = 'd MMMM yyyy'
const PAGE_SIZE = 10

function buildViewModel(history, applianceId, pagination) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const paginationConfig = buildPaginationConfig({
    paginationData: pagination,
    buildPageUrl: (pageNum) => `${returnHref}/action-history?page=${pageNum}`
  })

  return {
    pageTitle: content.pageTitle(history.name),
    heading: content.heading(history.name),
    content,
    rows: history.actions.map((action) => [
      { text: action.description },
      { text: action.completedBy },
      { text: formatDate(action.completedAt, DATE_FORMAT) }
    ]),
    hasPagination: paginationConfig.hasPagination,
    paginationItems: paginationConfig.items,
    previous: paginationConfig.previous,
    next: paginationConfig.next,
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      { text: 'Appliance records', href: '/appliance-records' },
      { text: history.name, href: returnHref }
    ]
  }
}

async function handleActionHistoryRequest(request, h) {
  const { applianceId } = request.params
  const page = Number(request.query?.page || 1)

  try {
    const response = await getApplianceActionHistory(applianceId, page)
    const history = response.data
    const pagination = response.pagination || {
      page,
      limit: PAGE_SIZE,
      total: history.actions.length,
      totalPages: 1
    }

    return h.view(
      'action-history/index',
      buildViewModel(history, applianceId, pagination)
    )
  } catch (error) {
    logger.error(
      `[actionHistory] failed to load ${applianceId}: ${error.message}`
    )

    const notFound = error.status === statusCodes.notFound

    return h
      .view('error/index', {
        message: notFound ? content.errors.notFound : content.errors.generic
      })
      .code(notFound ? statusCodes.notFound : statusCodes.internalServerError)
  }
}

export const actionHistoryController = {
  handler: handleActionHistoryRequest
}

export { handleActionHistoryRequest }
