import { fetchJson } from '../common/api/api.js'

const DEFAULT_LIMIT = 10

export async function getApplianceRecords({
  keywords = '',
  page = 1,
  limit = DEFAULT_LIMIT,
  filters = []
} = {}) {
  const query = new URLSearchParams()

  query.set('page', String(page))
  query.set('limit', String(limit))

  const trimmedKeywords = (keywords || '').trim()
  if (trimmedKeywords) {
    query.set('q', trimmedKeywords)
  }

  const normalisedFilters = Array.isArray(filters)
    ? filters.filter(Boolean).map((value) => String(value).trim().toLowerCase())
    : []

  if (normalisedFilters.length > 0) {
    query.set('status', normalisedFilters.join(','))
  }

  return fetchJson(`/api/appliances/search?${query.toString()}`)
}
