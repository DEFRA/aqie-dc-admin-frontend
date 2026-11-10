import Joi from 'joi'
import { manufacturingProcessController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const manufacturingProcess = {
  plugin: {
    name: 'manufacturingProcess',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/manufacturing-process/{fuelId}',
          ...manufacturingProcessController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
