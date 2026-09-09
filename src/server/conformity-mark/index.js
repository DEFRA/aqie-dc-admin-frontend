import Joi from 'joi'
import { conformityMarkController } from './controller.js'

/**
 * Routes for the conformity-mark technical review screen.
 * Registered from src/server/router.js and validated by a strict appliance ID schema.
 */

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const conformityMark = {
  plugin: {
    name: 'conformityMark',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/conformity-mark',
          handler: conformityMarkController.get,
          options: { validate: { params: applianceIdSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/conformity-mark',
          handler: conformityMarkController.post,
          options: {
            validate: {
              params: applianceIdSchema,
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
