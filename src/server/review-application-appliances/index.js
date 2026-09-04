import Joi from 'joi'
import { appliancesApplicationController } from './controller.js'

/**
 * Sets up the routes used in the /review-appliance-application page.
 * These routes are registered in src/server/router.js.
 */

const applicationIdSchema = Joi.object({
  applicationId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const reviewApplicationAppliances = {
  plugin: {
    name: 'reviewApplicationAppliances',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance-application/{applicationId}',
          ...appliancesApplicationController,
          options: {
            validate: { params: applicationIdSchema }
          }
        }
      ])
    }
  }
}
