import Joi from 'joi'
import {
  checkApplianceDetailsController,
  markCheckApplianceDetailsController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const checkApplianceDetails = {
  plugin: {
    name: 'checkApplianceDetails',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/appliance-details',
          ...checkApplianceDetailsController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/appliance-details',
          ...markCheckApplianceDetailsController,
          options: { validate: { params: paramsSchema } }
        }
      ])
    }
  }
}
