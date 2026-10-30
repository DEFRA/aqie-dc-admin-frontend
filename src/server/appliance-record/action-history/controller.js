import { actionHistoryContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceActionHistory } from './action-history-data.js'
import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { buildPaginationConfig } from '../../common/helpers/pagination-builder.js'
import { buildSubPageBreadcrumbs } from '../appliance-record-helpers.js'

const logger = createLogger()
const content = actionHistoryContent.en

const VIEW = 'appliance-record/action-history/index'
const DATE_FORMAT = 'd MMMM yyyy'
const PAGE_SIZE = 10

const buildActionRows = (actions) =>
  actions.map((action) => [
    { text: action.description },
    { text: action.completedBy },
    { text: formatDate(action.completedAt, DATE_FORMAT) }
  ])

// Backend may omit pagination; treat the response as a single page.
const resolvePagination = (response, page) =>
  response.pagination ?? {
    page,
    limit: PAGE_SIZE,
    total: response.data.actions.length,
    totalPages: 1
  }

function buildViewModel(history, applianceId, pagination) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`
  const { breadcrumbs } = buildSubPageBreadcrumbs(history.name, returnHref)
  const { hasPagination, items, previous, next } = buildPaginationConfig({
    paginationData: pagination,
    buildPageUrl: (pageNum) => `${returnHref}/action-history?page=${pageNum}`
  })

  return {
    pageTitle: content.pageTitle(history.name),
    heading: content.heading(history.name),
    content,
    rows: buildActionRows(history.actions),
    hasPagination,
    paginationItems: items,
    previous,
    next,
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs
  }
}

function renderError(h, error) {
  const notFound = error.status === statusCodes.notFound

  return h
    .view('error/index', {
      message: notFound ? content.errors.notFound : content.errors.generic
    })
    .code(notFound ? statusCodes.notFound : statusCodes.internalServerError)
}

async function handleActionHistoryRequest(request, h) {
  const { applianceId } = request.params
  // Joi defaults page to 1 at the route; the fallback covers direct calls.
  const page = request.query?.page ?? 1

  try {
    const response = await getApplianceActionHistory(applianceId, page)
    const pagination = resolvePagination(response, page)

    return h.view(VIEW, buildViewModel(response.data, applianceId, pagination))
  } catch (error) {
    logger.error(
      `[actionHistory] failed to load ${applianceId}: ${error.message}`
    )
    return renderError(h, error)
  }
}

export const actionHistoryController = {
  handler: handleActionHistoryRequest
}

export { handleActionHistoryRequest }
