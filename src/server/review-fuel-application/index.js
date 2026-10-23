import Joi from 'joi'
import { reviewFuelApplicationController } from './controller.js'

const paramsSchema = Joi.object({
  applicationId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const reviewFuelApplication = {
  plugin: {
    name: 'reviewFuelApplication',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel-application/{applicationId}',
          ...reviewFuelApplicationController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
