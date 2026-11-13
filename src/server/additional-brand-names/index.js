import Joi from 'joi'
import {
  additionalBrandNamesController,
  additionalBrandNamesDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const additionalBrandNames = {
  plugin: {
    name: 'additionalBrandNames',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/additional-brand-names',
          ...additionalBrandNamesController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/additional-brand-names',
          ...additionalBrandNamesDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                addBrands: Joi.string().valid('Yes', 'No').required(),
                additionalBrands: Joi.string().allow('').optional(),
                additionalRebrandBrands: Joi.string().allow('').optional()
              })
            }
          }
        },
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/additional-rebrand-names',
          ...additionalBrandNamesController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/additional-rebrand-names',
          ...additionalBrandNamesDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                addBrands: Joi.string().valid('Yes', 'No').required(),
                additionalBrands: Joi.string().allow('').optional(),
                additionalRebrandBrands: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
