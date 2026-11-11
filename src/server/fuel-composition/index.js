import Joi from 'joi'
import { fuelCompositionController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelComposition = {
  plugin: {
    name: 'fuelComposition',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-composition',
          ...fuelCompositionController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
