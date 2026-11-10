import Joi from 'joi'
import { fuelDescriptionFuelWeightController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDescriptionFuelWeight = {
  plugin: {
    name: 'fuelDescriptionFuelWeight',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-description/fuel-weight',
          ...fuelDescriptionFuelWeightController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
