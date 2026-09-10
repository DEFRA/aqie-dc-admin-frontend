import Joi from 'joi'
import {
  checkPermittedFuelsController,
  checkPermittedFuelsDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const checkPermittedFuels = {
  plugin: {
    name: 'checkPermittedFuels',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/permitted-fuels',
          ...checkPermittedFuelsController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/check-permitted-fuels',
          ...checkPermittedFuelsController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/permitted-fuels',
          ...checkPermittedFuelsDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                permFuelsCS: Joi.string().trim().min(1).required(),
                woodCS: Joi.string().valid('Yes', 'No').optional()
              })
            }
          }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/check-permitted-fuels',
          ...checkPermittedFuelsDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                permFuelsCS: Joi.string().trim().min(1).required(),
                woodCS: Joi.string().valid('Yes', 'No').optional()
              })
            }
          }
        }
      ])
    }
  }
}
