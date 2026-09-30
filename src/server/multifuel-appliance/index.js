import Joi from 'joi'
import {
  multifuelApplianceController,
  multifuelApplianceSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const multifuelAppliance = {
  plugin: {
    name: 'multifuelAppliance',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/multifuel-appliance',
          ...multifuelApplianceController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/multifuel-appliance',
          ...multifuelApplianceSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                multifuelAppliance: Joi.string().valid('Yes', 'No').optional()
              })
            }
          }
        }
      ])
    }
  }
}
