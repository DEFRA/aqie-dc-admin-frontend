import Joi from 'joi'
import {
  finishApplicationReviewController,
  finishApplicationReviewSubmitController
} from './controller.js'

/**
 * Sets up the route used in the application completion page - checks whether the review is complete and redirects accordingly.
 * This route is registered in src/server/router.js.
 */

const routeValidation = {
  params: Joi.object({
    applicationId: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(64)
      .pattern(/^[A-Za-z0-9-]+$/)
  })
}

export const finishApplicationReview = {
  plugin: {
    name: 'finishApplicationReview',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance-application/{applicationId}/finish-application-review',
          options: {
            validate: routeValidation
          },
          ...finishApplicationReviewController
        },
        {
          method: 'POST',
          path: '/review-appliance-application/{applicationId}/finish-application-review',
          options: {
            validate: routeValidation
          },
          ...finishApplicationReviewSubmitController
        }
      ])
    }
  }
}
