import Joi from 'joi'
import {
  fuelApplicationsController,
  startFuelApplicationReviewController
} from './controller.js'

const applicationIdSchema = Joi.object({
  applicationId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

/**
 * Sets up the routes used in the /fuel-applications page.
 * These routes are registered in src/server/router.js.
 */
export const fuelApplications = {
  plugin: {
    name: 'fuelApplications',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/fuel-applications',
          ...fuelApplicationsController
        },
        {
          method: 'POST',
          path: '/review-fuel-application/{applicationId}/start',
          ...startFuelApplicationReviewController,
          options: {
            validate: { params: applicationIdSchema }
          }
        }
      ])
    }
  }
}
