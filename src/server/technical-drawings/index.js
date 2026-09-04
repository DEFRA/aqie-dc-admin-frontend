import Joi from 'joi'
import {
  technicalDrawingsController,
  technicalDrawingsDecisionController
} from './controller.js'

/**
 * Sets up the routes used in the technical drawings review page.
 * These routes are registered in src/server/router.js.
 */

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const technicalDrawings = {
  plugin: {
    name: 'technicalDrawings',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/technical-drawings',
          ...technicalDrawingsController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/technical-drawings',
          ...technicalDrawingsDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                decision: Joi.string().valid('pass', 'fail').required()
              })
            }
          }
        }
      ])
    }
  }
}
