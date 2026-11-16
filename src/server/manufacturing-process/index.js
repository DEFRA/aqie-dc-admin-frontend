import Joi from 'joi'
import {
  manufacturingProcessController,
  manufacturingProcessSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
})

export const manufacturingProcess = {
  plugin: {
    name: 'manufacturingProcess',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/manufacturing-process',
          ...manufacturingProcessController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/manufacturing-process',
          ...manufacturingProcessSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                manufacturingProcess: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
