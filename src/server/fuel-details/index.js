import Joi from 'joi'
import { fuelDetailsController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDetails = {
  plugin: {
    name: 'fuelDetails',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/fuel-details/{fuelId}',
          ...fuelDetailsController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
