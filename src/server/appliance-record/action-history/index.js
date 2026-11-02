import Joi from 'joi'
import { actionHistoryController } from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
})

export const actionHistory = {
  plugin: {
    name: 'actionHistory',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/action-history',
          ...actionHistoryController,
          options: {
            validate: { params: paramsSchema, query: querySchema }
          }
        }
      ])
    }
  }
}
