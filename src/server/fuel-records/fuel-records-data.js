import { fetchJson } from '../common/api/api.js'

const DEFAULT_LIMIT = 10

export async function getFuelRecords({
  keywords = '',
  page = 1,
  limit = DEFAULT_LIMIT,
  filters = []
} = {}) {
  const trimmedKeywords = (keywords || '').trim()

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
