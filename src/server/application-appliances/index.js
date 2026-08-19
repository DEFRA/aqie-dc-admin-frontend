import { appliancesApplicationController } from './controller.js'

/**
 * Sets up the routes used in the /application-appliances page.
 * These routes are registered in src/server/router.js.
 */

export const applicationAppliances = {
  plugin: {
    name: 'applicationAppliances',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance-application/{applicationId}',
          ...appliancesApplicationController
        }
      ])
    }
  }
}
