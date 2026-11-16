import Joi from 'joi'
import {
  sulphurContentController,
  sulphurContentSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string().required().trim().min(1).max(64)
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
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/sulphur-content',
          ...sulphurContentSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                sulphurContent: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
