import Joi from 'joi'
import {
  qualityControlController,
  qualityControlSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
})

export const qualityControl = {
  plugin: {
    name: 'qualityControl',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/quality-control',
          ...qualityControlController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/quality-control',
          ...qualityControlSaveController,
          options: {
            validate: {
              params: paramsSchema,
              // Nothing selected means the field is absent from the payload
              payload: Joi.object({
                qualityControl: Joi.string().valid('yes', 'no').optional()
              })
            }
          }
        }
      ])
    }
  }
}
