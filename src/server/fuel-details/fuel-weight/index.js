import Joi from 'joi'
import { fuelWeightController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelWeight = {
  plugin: {
    name: 'fuelWeight',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/fuel-weight/{fuelId}',
          ...fuelWeightController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
