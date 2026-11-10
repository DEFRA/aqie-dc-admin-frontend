import Joi from 'joi'
import { qualityControlController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const qualityControl = {
  plugin: {
    name: 'qualityControl',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/quality-control/{fuelId}',
          ...qualityControlController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
