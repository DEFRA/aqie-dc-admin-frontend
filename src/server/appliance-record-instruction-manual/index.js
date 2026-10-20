import Joi from 'joi'
import { applianceRecordInstructionManualController } from './controller.js'

/**
 * Sets up the read-only instruction manual page,
 * accessible from an individual appliance record.
 * Registered in src/server/router.js.
 */

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const applianceRecordInstructionManual = {
  plugin: {
    name: 'applianceRecordInstructionManual',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/instruction-manual',
          ...applianceRecordInstructionManualController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/manuals',
          ...applianceRecordInstructionManualController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
