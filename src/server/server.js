import path from 'path'
import hapi from '@hapi/hapi'
import Scooter from '@hapi/scooter'
import hapiCookie from '@hapi/cookie'

import { router } from './router.js'
import { config } from '../config/config.js'
import { pulse } from './common/helpers/pulse.js'
import { catchAll } from './common/helpers/errors.js'
import { nunjucksConfig } from '../config/nunjucks/nunjucks.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { sessionCache } from './common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from './common/helpers/session-cache/cache-engine.js'
import { secureContext } from '@defra/hapi-secure-context'
import { contentSecurityPolicy } from './common/helpers/content-security-policy.js'
import { metrics } from '@defra/cdp-metrics'

export async function createServer() {
  setupProxy()
  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: getCacheEngine(config.get('session.cache.engine'))
      }
    ],
    state: {
      strictHeader: false
    }
  })
  await server.register([
    requestLogger,
    requestTracing,
    metrics,
    secureContext,
    pulse,
    sessionCache,
    nunjucksConfig,
    Scooter,
    contentSecurityPolicy,
    hapiCookie
  ])
  if (config.get('auth.ssoEnabled')) {
    server.auth.strategy('session', 'cookie', {
      cookie: {
        name: 'auth',
        password: config.get('session.cookie.password'),
        isSecure: config.get('session.cookie.secure'),
        isSameSite: 'Lax',
        isHttpOnly: true,
        path: '/',
        ttl: config.get('session.cookie.ttl'),
        clearInvalid: true
      },
      keepAlive: true,
      redirectTo: false, //Redirects handled by onPreResonse
      validate: async (_request, session) => {
        if (session?.isAuthenticated === true && session.user) {
          return { isValid: true, Credentials: session }
        }
        return { isValid: false }
      }
    })
  } else {
    server.logger.warn(
      'SSO DISABLED - dev bypass active; all request authenticated as stub user'
    )
    server.auth.scheme('dev-bypass', () => ({
      authenticate: (request, h) => {
        h.authenticated({
          credentials: {
            isAuthenticated: true,
            user: {
              id: config.get('auth.devUser.id'),
              email: config.get('auth.devUser.email'),
              name: config.get('auth.devUser.name')
            }
          }
        })
      }
    }))
    server.auth.strategy('session', 'dev-bypass')
  }

  //Every route now requires sign-in unless it sets auth:false
  server.auth.default({ strategy: 'session', mode: 'required' })

  await server.register([
    router // Register all the controllers/routes defined in src/server/router.js
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request
    if (!response.isBoom || response.output?.statusCode !== 401) {
      return h.continue
    }
    if (request.path.startsWith('/api/')) {
      return h.response({ error: 'Unauthorised' }).code(401).takeover()
    }
    request.yar.set(
      'returnTo',
      request.url.pathname + (request.url.search || '')
    )
    return h.redirect('auth/login').takeover()
  })

  //Expose the signed-in user to every view as {{ user }}

  server.ext('onPreResponse', (request, h) => {
    const { response } = request
    if (!response?.variety === 'view') {
      response.source.context = response.source.context || {}
      response.source.context.user = request.auth?.credentials?.user ?? null
    }
    return h.continue
  })

  server.ext('onPreResponse', catchAll)

  return server
}
