import { applianceApplicationsController } from './controller.js'

/**
 * Sets up the routes used in the /applications-appliances page.
 * These routes are registered in src/server/router.js.
 */
export const applicationsAppliances = {
  plugin: {
    name: 'applicationsAppliances',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/applications-appliances',
          ...applianceApplicationsController
        }
      ])
    }
  }
}
