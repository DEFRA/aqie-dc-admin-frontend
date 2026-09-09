import { applianceApplicationsController } from './controller.js'

/**
 * Sets up the routes used in the /appliance-applications page.
 * These routes are registered in src/server/router.js.
 */
export const applianceApplications = {
  plugin: {
    name: 'applianceApplications',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-applications',
          ...applianceApplicationsController
        }
      ])
    }
  }
}
