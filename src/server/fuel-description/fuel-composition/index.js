import Joi from 'joi'
import { fuelDescriptionFuelCompositionController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDescriptionFuelComposition = {
  plugin: {
    name: 'fuelDescriptionFuelComposition',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-description/fuel-composition',
          ...fuelDescriptionFuelCompositionController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
