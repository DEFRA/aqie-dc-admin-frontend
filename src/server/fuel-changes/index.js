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
          path: '/fuel-changes/{fuelId}',
          ...fuelChangesController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/fuel-changes/{fuelId}',
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
