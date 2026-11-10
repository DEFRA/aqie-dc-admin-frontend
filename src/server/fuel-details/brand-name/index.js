import Joi from 'joi'
import { brandNameController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const brandName = {
  plugin: {
    name: 'brandName',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-details/brand-name',
          ...brandNameController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
