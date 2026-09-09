import Joi from 'joi'
import {
  finishApplicationReviewController,
  incompleteApplicationReviewController
} from './controller.js'

/**
 * Sets up the routes used in the application completion page - checks for pending reviews and redirects accordingly.
 * These routes are registered in src/server/router.js.
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
        },
        {
          method: 'GET',
          path: '/application-review-incomplete/{applicationId}',
          options: {
            validate: routeValidation
          },
          ...incompleteApplicationReviewController
        }
      ])
    }
  }
}
