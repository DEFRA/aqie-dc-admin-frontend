/**
 * Pagination Builder Helper
 *
 * A reusable utility for constructing pagination metadata from API responses.
 * Used across multiple pages that display paginated data with filters/search.
 *
 * @module pagination-builder
 */

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

  // Calculate display range
  const start = total === 0 ? 0 : (currentPageNumber - 1) * limit + 1

  const end = Math.min(currentPageNumber * limit, total)

  // Build page links for all pages
  const pageLinks = Array.from(
    { length: Math.max(totalPages || 1, 1) },
    (_item, index) => ({
      page: index + 1,
      href: buildPageUrl(index + 1)
    })
  )

  // Create pagination items for GOV.UK component
  const items = pageLinks.map((pageLink) => ({
    number: pageLink.page,
    href: pageLink.href,
    current: pageLink.page === currentPageNumber
  }))

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
