import Joi from 'joi'
import {
  fuelChangesController,
  fuelChangesDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelChanges = {
  plugin: {
    name: 'fuelChanges',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-changes',
          ...fuelChangesController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-changes',
          ...fuelChangesDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                isChangedOrMixed: Joi.string().valid('Yes', 'No').required(),
                changes: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
