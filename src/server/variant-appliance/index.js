import Joi from 'joi'
import {
  variantApplianceController,
  variantApplianceDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const variantAppliance = {
  plugin: {
    name: 'variantAppliance',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/variant-appliance',
          ...variantApplianceController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/variant-appliance',
          ...variantApplianceDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                isVariantCS: Joi.string().valid('Yes', 'No').required(),
                variantDetailsCS: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
