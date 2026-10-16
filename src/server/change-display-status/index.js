/**
 * Registers the appliance public visibility change route.
 *
 * This feature is mounted on the appliance record route so the user can confirm
 * a visibility change from the detailed appliance page without leaving the flow.
 */
import Joi from 'joi'
import {
  changeDisplayStatusController,
  changeDisplayStatusSubmitController
} from './controller.js'

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const changeDisplayStatus = {
  plugin: {
    name: 'change-display-status',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/change-display-status',
          ...changeDisplayStatusController,
          options: {
            validate: { params: applianceIdSchema }
          }
        },
        {
          method: 'POST',
          path: '/appliance-record/{applianceId}/change-display-status',
          ...changeDisplayStatusSubmitController,
          options: {
            validate: {
              params: applianceIdSchema
            }
          }
        }
      ])
    }
  }
}
