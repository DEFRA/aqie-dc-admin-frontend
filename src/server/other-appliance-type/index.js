import Joi from 'joi'
import {
  otherApplianceTypeController,
  otherApplianceTypeDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const otherApplianceType = {
  plugin: {
    name: 'otherApplianceType',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/other-appliance-type',
          ...otherApplianceTypeController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/other-appliance-type',
          ...otherApplianceTypeDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                otherApplianceType: Joi.string().required()
              })
            }
          }
        }
      ])
    }
  }
}
