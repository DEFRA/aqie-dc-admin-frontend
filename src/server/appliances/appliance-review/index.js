import { applianceReviewController } from './controller.js'

/**
 * Sets up the routes used in the /appliances-review page.
 * These routes are registered in src/server/router.js.
 */

export const applianceReview = {
  plugin: {
    name: 'applianceReview',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-review',
          //{applicationId}
          ...applianceReviewController
        }
      ])
    }
  }
}
