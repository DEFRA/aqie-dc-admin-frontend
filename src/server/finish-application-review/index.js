import Joi from 'joi'
import { finishApplicationReviewController } from './controller.js'

/**
 * Sets up the route used in the application completion page - checks whether the review is complete and redirects accordingly.
 * This route is registered in src/server/router.js.
 */

const routeValidation = {
  params: Joi.object({
    applicationId: Joi.string().required().trim().min(1).max(64)
  })
}

export const finishApplicationReview = {
  plugin: {
    name: 'finishApplicationReview',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/finish-application-review/{applicationId}',
          options: {
            validate: routeValidation
          },
          ...finishApplicationReviewController
        }
      ])
    }
  }
}
