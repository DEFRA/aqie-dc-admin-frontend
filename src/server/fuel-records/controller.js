import { fuelRecordsContent } from './content.js'
import { getFuelRecords } from './fuel-records-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { buildPaginationConfig } from '../common/helpers/pagination-builder.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { formatId } from '../../config/nunjucks/filters/format-id.js'

const logger = createLogger()
const content = fuelRecordsContent.en

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'live', label: 'Live' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'rejected', label: 'Rejected' }
]

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

  return `/fuel-records?${params.toString()}`
}

function buildFuelRows(rawData, contentLabels) {
  return (rawData || []).map((item) => {
    const status = String(item.status || 'pending').toLowerCase()
    const fuelId = item.fuelId || item.id || 'Unknown fuel ID'
    const brandName = item.brandName || item.name || 'Unknown fuel'
    const statusLabel = contentLabels.statusLabels[status] || status
    const statusClass = contentLabels.statusClasses[status] || 'govuk-tag--grey'
    const href = `/fuel-record/${encodeURIComponent(item.id || fuelId)}`

    return [
      { text: formatId(fuelId) },
      { text: brandName },
      {
        html: `<strong class="govuk-tag ${statusClass}">
                ${statusLabel}
               </strong>`
      },
      {
        html: `<a class="govuk-link" href="${href}">${contentLabels.viewLabel}<span class="govuk-visually-hidden"> detail of ${brandName}</span></a>`
      }
    ]
  })
}

async function handleFuelRecordsRequest(request, h) {
  try {
    const query =
      request.method === 'post' && request.payload
        ? request.payload
        : request.query || {}

    const parsedPage = Number.parseInt(query.page, 10)
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
    const keywords = String(query.keywords || query.q || '').trim()
    const selectedFilters = parseFilters(query.filters)

    const response = await getFuelRecords({
      keywords,
      page,
      filters: selectedFilters,
      limit: 10
    })

    const fuelRows = buildFuelRows(response?.data, content)

    const pagination = response?.pagination || {
      page,
      limit: 10,
      total: 0,
      totalPages: 0
    }

    const paginationConfig = buildPaginationConfig({
      paginationData: pagination,
      buildPageUrl: (pageNum) =>
        buildPageUrl({
          keywords,
          filters: selectedFilters,
          page: pageNum
        })
    })

    return h.view('fuel-records/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      content,
      keywords,

      filters: statusOptions.map((option) => ({
        ...option,
        checked: selectedFilters.includes(option.value)
      })),

      fuelRows,

      pagination,
      pageNumber: paginationConfig.currentPage,
      totalPages: paginationConfig.totalPages,

      countText: `${content.showingLabel} ${paginationConfig.start.toLocaleString('en-GB')} to ${paginationConfig.end.toLocaleString('en-GB')} ${content.ofLabel} ${paginationConfig.total.toLocaleString('en-GB')} ${content.recordsLabel}`,

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
    logger.error(`[fuel-records.GET] failed: ${error.message}`, error)

    return h
      .view('error/index', {
        message: content.errors.generic
      })
      .code(statusCodes.internalServerError)
  }
}

const fuelRecordsController = {
  handler: handleFuelRecordsRequest
}

export { handleFuelRecordsRequest, fuelRecordsController }
