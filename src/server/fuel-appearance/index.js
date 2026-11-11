import Joi from 'joi'
import {
  fuelAppearanceController,
  fuelAppearanceSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
})

export const fuelAppearance = {
  plugin: {
    name: 'fuelAppearance',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-appearance',
          ...fuelAppearanceController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-appearance',
          ...fuelAppearanceSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                appearance: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
