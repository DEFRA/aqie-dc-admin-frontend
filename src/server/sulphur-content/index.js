import Joi from 'joi'
import { sulphurContentController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const sulphurContent = {
  plugin: {
    name: 'sulphurContent',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/sulphur-content',
          ...sulphurContentController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
