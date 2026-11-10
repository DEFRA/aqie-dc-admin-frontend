import Joi from 'joi'
import { additionalBrandNamesController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const additionalBrandNames = {
  plugin: {
    name: 'additionalBrandNames',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-details/additional-brand-names',
          ...additionalBrandNamesController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
