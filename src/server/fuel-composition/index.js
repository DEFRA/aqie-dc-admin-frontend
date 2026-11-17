import Joi from 'joi'
import {
  fuelCompositionController,
  fuelCompositionSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
})

export const fuelComposition = {
  plugin: {
    name: 'fuelComposition',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-composition',
          ...fuelCompositionController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-composition',
          ...fuelCompositionSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                composition: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
