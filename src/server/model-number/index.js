import Joi from 'joi'
import {
  modelNumberController,
  modelNumberDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const modelNumber = {
  plugin: {
    name: 'modelNumber',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/model-number',
          ...modelNumberController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/model-number',
          ...modelNumberDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                modelNumber: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
