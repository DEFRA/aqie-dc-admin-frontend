import Joi from 'joi'
import { applianceApplicationDetailsController } from './controller.js'

/**
 * Sets up the route for the read-only application details page,
 * accessible from an individual appliance record.
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

export const applianceApplicationDetails = {
  plugin: {
    name: 'applianceApplicationDetails',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/manage-certification/appliance-record/{applianceId}/application-details',
          ...applianceApplicationDetailsController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
