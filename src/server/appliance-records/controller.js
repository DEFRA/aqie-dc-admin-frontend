import { applianceRecordsContent } from './content.js'
import { getApplianceRecords } from './appliance-records-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { buildPaginationConfig } from '../common/helpers/pagination-builder.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { formatId } from '../../config/nunjucks/filters/format-id.js'

const logger = createLogger()
const content = applianceRecordsContent.en

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'live', label: 'Live' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'rejected', label: 'Rejected' }
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function parseFilters(filters) {
  if (!filters) {
    return []
  }

  return (Array.isArray(filters) ? filters : [filters])
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

function buildPageUrl({ keywords, filters, page }) {
  const params = new URLSearchParams()

  if (keywords) {
    params.set('keywords', keywords)
  }

  if (filters.length > 0) {
    params.set('filters', filters.join(','))
  }

  params.set('page', String(page))

  return `/appliance-records?${params.toString()}`
}

function buildApplianceRows(rawData, contentLabels) {
  return rawData.map((item) => {
    const status = String(item.status || 'pending').toLowerCase()
    const applianceId = item.id
    const name = item.name
    const statusLabel = contentLabels.statusLabels[status] || status
    const statusClass = contentLabels.statusClasses[status] || 'govuk-tag--grey'
    const href = `/appliance-record/${encodeURIComponent(applianceId)}`

    return [
      { text: formatId(applianceId) },
      { text: name },
      {
        html: `<strong class="govuk-tag ${escapeHtml(statusClass)}">
                ${escapeHtml(statusLabel)}
               </strong>`
      },
      {
        html: `<a href="${escapeHtml(href)}">
                 View
                 <span class="govuk-visually-hidden">
                   details of ${escapeHtml(name)}
                 </span>
               </a>`
      }
    ]
  })
}

async function handleApplianceRecordsRequest(request, h) {
  try {
    const query =
      request.method === 'post' && request.payload
        ? request.payload
        : request.query || {}

    const parsedPage = Number.parseInt(query.page, 10)
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
    const keywords = String(query.keywords || query.q || '').trim()
    const selectedFilters = parseFilters(query.filters)

    const response = await getApplianceRecords({
      keywords,
      page,
      filters: selectedFilters,
      limit: 10
    })

    if (
      !Array.isArray(response?.data) ||
      typeof response?.pagination?.totalPages !== 'number'
    ) {
      throw new Error('Invalid backend response')
    }

    const applianceRows = buildApplianceRows(response.data, content)
    const { pagination } = response

    // Build pagination config using reusable helper
    const paginationConfig = buildPaginationConfig({
      paginationData: pagination,
      buildPageUrl: (pageNum) =>
        buildPageUrl({
          keywords,
          filters: selectedFilters,
          page: pageNum
        })
    })

    return h.view('appliance-records/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      content,
      keywords,

      filters: statusOptions.map((option) => ({
        ...option,
        checked: selectedFilters.includes(option.value)
      })),

      applianceRows,

      pagination,
      pageNumber: paginationConfig.currentPage,
      totalPages: paginationConfig.totalPages,

      countText: `Showing ${paginationConfig.start.toLocaleString('en-GB')} to ${paginationConfig.end.toLocaleString('en-GB')} of ${paginationConfig.total.toLocaleString('en-GB')} records`,

      paginationItems: paginationConfig.items,
      previous: paginationConfig.previous,
      next: paginationConfig.next,

      hasPagination: paginationConfig.hasPagination,

      emptyMessage: content.emptyMessage,
      activeFilters: selectedFilters,

      breadcrumbs: [
        {
          text: 'Home',
          href: '/manage-certification'
        },
        {
          text: content.heading
        }
      ]
    })
  } catch (error) {
    logger.error(`[appliance-records.GET] failed: ${error.message}`, error)

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const applianceRecordsController = {
  handler: handleApplianceRecordsRequest
}

export { handleApplianceRecordsRequest, applianceRecordsController }
