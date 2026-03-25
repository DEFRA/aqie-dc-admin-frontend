import { msalClient } from '../../config/azure-auth.js'
import { config } from '../../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export const azureAuth = {
  plugin: {
    name: 'azure-auth',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/auth/login',
          handler: async (request, h) => {
            try {
              const authCodeUrlParameters = {
                scopes: ['openid', 'profile', 'email'],
                redirectUri: config.get('azure.redirectUri'),
                responseMode: 'form_post'
              }

              const response = await msalClient.getAuthCodeUrl(
                authCodeUrlParameters
              )
              return h.redirect(response)
            } catch (error) {
              logger.error('Azure AD login error:', error)
              return h.redirect('/error')
            }
          }
        },
        {
          method: 'POST',
          path: '/auth/callback',
          handler: async (request, h) => {
            try {
              const tokenRequest = {
                code: request.payload.code,
                scopes: ['openid', 'profile', 'email'],
                redirectUri: config.get('azure.redirectUri')
              }

              const response = await msalClient.acquireTokenByCode(tokenRequest)

              request.yar.set('user', {
                id: response.account.homeAccountId,
                email: response.account.username,
                name: response.account.name
              })

              request.cookieAuth.set({
                user: response.account,
                isAuthenticated: true
              })

              return h.redirect('/home')
            } catch (error) {
              logger.error('Azure AD callback error:', error)
              return h.redirect('/error')
            }
          }
        },
        {
          method: 'GET',
          path: '/auth/logout',
          handler: async (request, h) => {
            request.cookieAuth.clear()
            request.yar.clear()

            const logoutUri = `https://login.microsoftonline.com/${config.get('azure.tenantId')}/oauth2/v2.0/logout`
            return h.redirect(logoutUri)
          }
        }
      ])
    }
  }
}
