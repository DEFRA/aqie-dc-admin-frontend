import Joi from 'joi'
import { legacyCommentsController } from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const legacyComments = {
  plugin: {
    name: 'legacyComments',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/legacy-comments',
          ...legacyCommentsController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
