import Joi from 'joi'
import {
  originalManufacturerController,
  originalManufacturerDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const originalManufacturer = {
  plugin: {
    name: 'originalManufacturer',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/original-manufacturer',
          ...originalManufacturerController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/original-manufacturer',
          ...originalManufacturerDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                manufacturer: Joi.string().trim().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
