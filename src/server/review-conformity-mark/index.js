import Joi from 'joi'
import { reviewConformityController } from './controller.js'

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const reviewConformityMark = {
  plugin: {
    name: 'reviewConformityMark',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/review-conformity-mark',
          handler: reviewConformityController.get,
          options: { validate: { params: applianceIdSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/review-conformity-mark',
          handler: reviewConformityController.post,
          options: {
            validate: {
              params: applianceIdSchema,
              payload: Joi.object({ decision: Joi.string().valid('pass', 'fail').required() })
            }
          }
        }
      ])
    }
  }
}
