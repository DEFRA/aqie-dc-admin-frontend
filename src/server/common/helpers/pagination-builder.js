/**
 * Pagination Builder Helper
 *
 * A reusable utility for constructing pagination metadata from API responses.
 * Used across multiple pages that display paginated data with filters/search.
 *
 * @module pagination-builder
 */

const MAX_UNTRUNCATED_PAGES = 5

/**
 * Builds windowed GOV.UK pagination items with ellipses when totalPages. > 5.
 *
 * @param {number} currentPageNumber - Active 1-based page number
 * @param {number} totalPagesCount - Total number of pages (at least 1)
 * @param {Function} buildPageUrl - Function to build page URLs
 * @returns {Array<Object>} GOV.UK pagination `items` array
 */
function buildPaginationItems(
  currentPageNumber,
  totalPagesCount,
  buildPageUrl
) {
  const createPageItem = (pageNum) => ({
    number: pageNum,
    href: buildPageUrl(pageNum),
    current: pageNum === currentPageNumber
  })

  if (totalPagesCount <= MAX_UNTRUNCATED_PAGES) {
    return Array.from({ length: totalPagesCount }, (_item, index) =>
      createPageItem(index + 1)
    )
  }

  // Near the start (pages 1..3): 1, 2, 3, 4, ..., last
  if (currentPageNumber <= 3) {
    return [
      createPageItem(1),
      createPageItem(2),
      createPageItem(3),
      createPageItem(4),
      { ellipsis: true },
      createPageItem(totalPagesCount)
    ]
  }

  // Near the end (last 3 pages): 1, ..., last-3, last-2, last-1, last
  if (currentPageNumber >= totalPagesCount - 2) {
    return [
      createPageItem(1),
      { ellipsis: true },
      createPageItem(totalPagesCount - 3),
      createPageItem(totalPagesCount - 2),
      createPageItem(totalPagesCount - 1),
      createPageItem(totalPagesCount)
    ]
  }

  // Middle pages: 1, ..., current-1, current, current+1, ..., last
  return [
    createPageItem(1),
    { ellipsis: true },
    createPageItem(currentPageNumber - 1),
    createPageItem(currentPageNumber),
    createPageItem(currentPageNumber + 1),
    { ellipsis: true },
    createPageItem(totalPagesCount)
  ]
}

/**
 * Builds pagination configuration for GOV.UK pagination component
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.paginationData - Pagination data from API response
 * @param {number} options.paginationData.page - Current page number
 * @param {number} options.paginationData.limit - Items per page
 * @param {number} options.paginationData.total - Total number of items
 * @param {number} options.paginationData.totalPages - Total number of pages
 * @param {number} [options.currentPage] - Override current page (optional)
 * @param {Function} options.buildPageUrl - Function to build page URLs with params
 *                                          Signature: (page: number) => string
 * @returns {Object} Pagination configuration object with GOV.UK component data
 */
export function buildPaginationConfig({
  paginationData = {},
  currentPage,
  buildPageUrl
} = {}) {
  if (typeof buildPageUrl !== 'function') {
    throw new Error('buildPageUrl function is required')
  }

  const { page = 1, limit = 10, total = 0, totalPages = 0 } = paginationData

  const currentPageNumber = currentPage ?? page
  const totalPagesCount = Math.max(totalPages || 1, 1)

  // Calculate display range
  const start = total === 0 ? 0 : (currentPageNumber - 1) * limit + 1

  const end = Math.min(currentPageNumber * limit, total)

  // Create pagination items for GOV.UK component
  const items = buildPaginationItems(
    currentPageNumber,
    totalPagesCount,
    buildPageUrl
  )

  // Build previous link
  const previousLink =
    currentPageNumber > 1
      ? {
          href: buildPageUrl(currentPageNumber - 1),
          text: 'Previous'
        }
      : null

  // Build next link
  const nextLink =
    currentPageNumber < (totalPages || 1)
      ? {
          href: buildPageUrl(currentPageNumber + 1),
          text: 'Next'
        }
      : null

  return {
    // Display range info
    start,
    end,
    total,
    currentPage: currentPageNumber,
    totalPages: totalPages || 1,
    limit,

    // Display text components
    countText: {
      start,
      end,
      total,
      limit
    },

    // GOV.UK pagination component config
    previous: previousLink,
    next: nextLink,
    items,
    hasPagination: (totalPages || 0) > 1
  }
}
