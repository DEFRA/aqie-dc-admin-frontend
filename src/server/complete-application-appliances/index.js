import Joi from 'joi'
import { completeApplicationAppliancesController } from './controller.js'

/**
 * Sets up the routes used in the /complete-appliance-application page.
 * These routes are registered in src/server/router.js.
 */

export const completeApplicationAppliances = {
  plugin: {
    name: 'completeApplicationAppliances',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/complete-appliance-application/{applicationId}',
          options: {
            validate: {
              params: Joi.object({
                applicationId: Joi.string().required().trim().min(1).max(64)
              })
            }
          },
          ...completeApplicationAppliancesController
        }
      ])
    }
  }
}
