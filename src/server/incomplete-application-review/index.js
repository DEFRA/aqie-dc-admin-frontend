import Joi from 'joi'
import { incompleteApplicationReviewController } from './controller.js'

/**
 * Sets up the route for the incomplete application review page.
 * This route is registered in src/server/router.js.
 */

export const incompleteApplicationReview = {
  plugin: {
    name: 'incompleteApplicationReview',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/incomplete-application-review/{applicationId}',
          options: {
            validate: {
              params: Joi.object({
                applicationId: Joi.string()
                  .required()
                  .trim()
                  .min(1)
                  .max(64)
                  .pattern(/^[A-Za-z0-9-]+$/)
              })
            }
          },
          ...incompleteApplicationReviewController
        }
      ])
    }
  }
}
