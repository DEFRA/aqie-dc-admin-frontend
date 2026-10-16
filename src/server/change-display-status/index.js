/**
 * Registers the appliance public visibility change route.
 *
 * This feature is mounted on the appliance record route so the user can confirm
 * a visibility change from the detailed appliance page without leaving the flow.
 */
import {
  changeDisplayStatusController,
  changeDisplayStatusSubmitController
} from './controller.js'

export const changeDisplayStatus = {
  plugin: {
    name: 'change-display-status',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/change-display-status',
          ...changeDisplayStatusController
        },
        {
          method: 'POST',
          path: '/appliance-record/{applianceId}/change-display-status',
          ...changeDisplayStatusSubmitController
        }
      ])
    }
  }
}
