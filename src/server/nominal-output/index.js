import Joi from 'joi'
import {
  nominalOutputController,
  nominalOutputSaveController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const nominalOutput = {
  plugin: {
    name: 'nominalOutput',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/nominal-output',
          ...nominalOutputController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/nominal-output',
          ...nominalOutputSaveController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                nominalOutput: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
