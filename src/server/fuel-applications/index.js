/**
 * Sets up the routes used in the /fuel-applications page.
 * These routes are registered in src/server/router.js.
 */
import { fuelApplicationsController } from './controller.js'

export const fuelApplications = {
  plugin: {
    name: 'fuelApplications',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/fuel-applications',
          ...fuelApplicationsController
        }
      ])
    }
  }
}
