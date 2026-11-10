import Joi from 'joi'
import {
  originalBrandController,
  originalBrandDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const originalBrand = {
  plugin: {
    name: 'originalBrand',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/original-brand/{fuelId}',
          ...originalBrandController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/original-brand/{fuelId}',
          ...originalBrandDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                originalName: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
