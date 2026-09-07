import fetch from 'node-fetch'
import { config } from '../../../config/config.js'
import { createLogger } from '../helpers/logging/logger.js'

const logger = createLogger()

function buildUrl(path) {
  const base = config.get('backend.url').replace(/\/$/, '')
  const normalisedUrl = path.startsWith('/') ? path : `/${path}`
  logger.info(`API-URL: Fetching records from ${base}${normalisedUrl}`)
  return `${base}${normalisedUrl}`
}

function defaultHeaders() {
  return {
    'x-api-key': config.get('cdpXApiKey'),
    'Content-Type': 'application/json'
  }
}

async function request(method, path, body) {
  const url = buildUrl(path)

  const response = await fetch(url, {
    method,
    headers: defaultHeaders(),
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    const text = await response.text()
    logger.error(
      `[api.${method}] ${path} -> ${response.status}: ${text.slice(0, 200)}`
    )
    const error = new Error(
      `Backend ${method} ${path} failed: ${response.status}`
    )
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}

/**
 * Get against the backend, returns parsed Json.
 * @ param {string} path Path beginning with '/'
 * @ returns {Promise<any>}
 */

export function fetchJson(path) {
  return request('GET', path)
}

/**
 * Patch against the backend, with Json body.
 * @ param {string} path
 * @ param {object} payload
 * @ returns {Promise<any>}
 */

export function patchJson(path, payload) {
  return request('PATCH', path, payload)
}
