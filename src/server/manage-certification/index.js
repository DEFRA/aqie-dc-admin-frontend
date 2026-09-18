import { dashboardController } from './controller.js'

/**
 * Sets up the routes used in the /dashboard page.
 * These routes are registered in src/server/router.js.
 */
export const manageCertification = {
  plugin: {
    name: 'manage-certification',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/manage-certification',
          ...dashboardController
        }
      ])
    }
  }
}
