import Joi from 'joi'
import {
  applianceTypeController,
  applianceTypeDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

const applianceTypes = [
  'Stove',
  'Boiler',
  'Inset appliance',
  'Cooker',
  'Pizza oven',
  'Other'
]

export const applianceType = {
  plugin: {
    name: 'applianceType',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/appliance-type',
          ...applianceTypeController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/appliance-type',
          ...applianceTypeDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                applianceType: Joi.string()
                  .valid(...applianceTypes)
                  .required()
              })
            }
          }
        }
      ])
    }
  }
}
