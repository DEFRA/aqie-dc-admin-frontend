import { appliancesApplicationController } from './controller.js'

/**
 * Sets up the routes used in the /application-appliances page.
 * These routes are registered in src/server/router.js.
 */
//this screen will be access by the url /application-appliances/'applicationId' and will be used to review the application for appliances. How do o this? I
//the first change is in this file, i need to edit the path to include the applicationId,
//  then in the controller i will need to get the applicationId from the request and use it to get the application data from the database and pass it to the view. The view will then display the application data and allow the user to review it.
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
