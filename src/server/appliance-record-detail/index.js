import Joi from 'joi'
import { applianceRecordDetailController } from './controller.js'

/**
 * Sets up the route for the read-only appliance details page,
 * accessible from the appliance record section.
 * Registered in src/server/router.js.
 */

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const applianceRecordDetail = {
  plugin: {
    name: 'applianceRecordDetail',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/manage-certification/appliance-record/{applianceId}/appliance-details',
          ...applianceRecordDetailController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
