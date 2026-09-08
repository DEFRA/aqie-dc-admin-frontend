import Joi from 'joi'
import {
  applianceReviewController,
  applianceDecisionController
} from './controller.js'

/**
 * Sets up the routes used in the /review-appliance page.
 * These routes are registered in src/server/router.js.
 */

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const reviewAppliance = {
  plugin: {
    name: 'reviewAppliance',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}',
          ...applianceReviewController,
          options: {
            validate: { params: applianceIdSchema }
          }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}',
          ...applianceDecisionController,
          options: {
            validate: {
              params: applianceIdSchema,
              payload: Joi.object({
                decision: Joi.string().valid('accept', 'reject').required()
              })
            }
          }
        }
      ])
    }
  }
}
