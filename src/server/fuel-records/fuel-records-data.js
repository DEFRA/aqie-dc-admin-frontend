import { fetchJson } from '../common/api/api.js'

const DEFAULT_LIMIT = 10
const SAFE_SEARCH_PATTERN = /^[a-zA-Z0-9\s\-_.&']*$/
const MAX_SEARCH_LENGTH = 50

export async function getFuelRecords({
  keywords = '',
  page = 1,
  limit = DEFAULT_LIMIT,
  filters = []
} = {}) {
  const trimmedKeywords = (keywords || '').trim()

  if (
    trimmedKeywords.length > MAX_SEARCH_LENGTH ||
    !SAFE_SEARCH_PATTERN.test(trimmedKeywords)
  ) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0
      }
    }
  }

  const query = new URLSearchParams()

  query.set('page', String(page))
  query.set('limit', String(limit))

  if (trimmedKeywords) {
    query.set('q', trimmedKeywords)
  }

  const normalisedFilters = Array.isArray(filters)
    ? filters.filter(Boolean).map((value) => String(value).trim().toLowerCase())
    : []

  if (normalisedFilters.length > 0) {
    query.set('status', normalisedFilters.join(','))
  }

  return fetchJson(`/admin/fuels?${query.toString()}`)
}
