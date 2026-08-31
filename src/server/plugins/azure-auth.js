import { CryptoProvider } from '@azure/msal-node'
import { msalClient } from '../../config/azure-auth.js'
import { config } from '../../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

let cryptoProvider
const getCryptoProvider = () => (cryptoProvider ??= new CryptoProvider())
const SCOPES = ['openid', 'profile', 'email']

const renderAuthError = (h, message) =>
  h.view('error/index', {
    pageTitle: 'Sign-in error',
    heading: 'Sign-in error',
    message
  })

export const azureAuth = {
  plugin: {
    name: 'azure-auth',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: '/auth/login',
          options: { auth: false },
          handler: async (request, h) => {
            try {
              const state = getCryptoProvider().createNewGuid()
              const nonce = getCryptoProvider().createNewGuid()
              request.yar.set('authFlow', { state, nonce })

              const authUrl = await msalClient().getAuthCodeUrl({
                scopes: SCOPES,
                redirectUri: config.get('azure.redirectUri'),
                responseMode: 'query',
                state,
                nonce
              })
              return h.redirect(authUrl)
            } catch (error) {
              logger.error({ err: error }, 'Azure AD login error')
              return renderAuthError(
                h,
                'Could not start sign-in. Please try again.'
              )
            }
          }
        },
        {
          method: 'GET',
          path: '/auth/callback',
          options: { auth: false },
          handler: async (request, h) => {
            try {
              if (request.query.error) {
                logger.warn(
                  { error: request.query.error },
                  'Azure AD returned an error'
                )
                return renderAuthError(
                  h,
                  'Sign-in was cancelled or failed. Please try again.'
                )
              }

              const { code, state } = request.query
              const authFlow = request.yar.get('authFlow')
              request.yar.clear('authFlow')

              if (!code || !state || !authFlow || state !== authFlow.state) {
                logger.warn('Invalid or missing OAuth state on callback')
                return renderAuthError(
                  h,
                  'Your sign-in session expired. Please try again.'
                )
              }

              const response = await msalClient().acquireTokenByCode({
                code,
                scopes: SCOPES,
                redirectUri: config.get('azure.redirectUri'),
                nonce: authFlow.nonce
              })

              request.cookieAuth.set({
                isAuthenticated: true,
                user: {
                  id: response.account.homeAccountId,
                  email: response.account.username,
                  name: response.account.name
                }
              })

              const returnTo = request.yar.get('returnTo') || '/'
              request.yar.clear('returnTo')
              return h.redirect(returnTo)
            } catch (error) {
              logger.error({ err: error }, 'Azure AD callback error')
              return renderAuthError(
                h,
                'Could not complete sign-in. Please try again.'
              )
            }
          }
        },
        {
          method: 'GET',
          path: '/auth/logout',
          options: { auth: false },
          handler: (request, h) => {
            // Second hop: Microsoft sent the user back after sign-out
            if (request.query.confirmed === 'true') {
              return h.redirect('/')
            }
            request.cookieAuth.clear()
            request.yar.reset()

            const tenantId = config.get('azure.tenantId')
            if (!tenantId) {
              return h.redirect('/')
            }
            return h.redirect(
              `${config.get('azure.authorityHost')}/${tenantId}/oauth2/v2.0/logout`
            )
          }
        }
      ])
    }
  }
}
