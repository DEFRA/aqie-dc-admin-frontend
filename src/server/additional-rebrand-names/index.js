import Joi from 'joi'
import {
  additionalRebrandNamesController,
  additionalRebrandNamesDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const additionalRebrandNames = {
  plugin: {
    name: 'additionalRebrandNames',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/additional-rebrand-names',
          ...additionalRebrandNamesController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/additional-rebrand-names',
          ...additionalRebrandNamesDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                addBrands: Joi.string().valid('Yes', 'No').required(),
                additionalBrands: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
