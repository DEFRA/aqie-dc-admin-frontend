import { config } from '../../config/config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const loginController = {
  handler: (request, h) => {
    if (request.auth.isAuthenticated) {
      logger.info('User already authenticated')
      return h.redirect('/Uploader')
    }
    return h.redirect('/auth/login')
  }
}

export { loginController }
