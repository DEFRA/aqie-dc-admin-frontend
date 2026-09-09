import Joi from 'joi'
import { applicationReviewCompleteController } from './controller.js'

/**
 * Sets up the route used in the application review complete page.
 * This route is registered in src/server/router.js.
 */

const routeValidation = {
  params: Joi.object({
    applicationId: Joi.string().required().trim().min(1).max(64)
  })
}

export const applicationReviewComplete = {
  plugin: {
    name: 'applicationReviewComplete',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/application-review-complete/{applicationId}',
          options: {
            validate: routeValidation
          },
          ...applicationReviewCompleteController
        }
      ])
    }
  }
}
