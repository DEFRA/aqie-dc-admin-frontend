import Joi from 'joi'
import { fuelDescriptionManufacturingProcessController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDescriptionManufacturingProcess = {
  plugin: {
    name: 'fuelDescriptionManufacturingProcess',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-description/manufacturing-process',
          ...fuelDescriptionManufacturingProcessController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
