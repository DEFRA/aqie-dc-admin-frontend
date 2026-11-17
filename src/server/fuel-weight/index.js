import Joi from 'joi'
import { fuelWeightController, fuelWeightSaveController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
})

export const fuelWeight = {
  plugin: {
    name: 'fuelWeight',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-weight',
          ...fuelWeightController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-weight',
          ...fuelWeightSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                weight: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
