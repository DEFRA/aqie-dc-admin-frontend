import Joi from 'joi'
import {
  modelNameController,
  modelNameDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const modelName = {
  plugin: {
    name: 'modelName',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/model-name',
          ...modelNameController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/model-name',
          ...modelNameDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                modelName: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
