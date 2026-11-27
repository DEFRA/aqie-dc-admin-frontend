import Joi from 'joi'
import { fuelRecordController } from './controller.js'

/**
 * Route: GET /fuel-record/{fuelId}
 * Shows a single (non-legacy) fuel record for pending, live or hidden fuels.
 */
const fuelIdSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelRecord = {
  plugin: {
    name: 'fuelRecord',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/fuel-record/{fuelId}',
          ...fuelRecordController,
          options: {
            validate: { params: fuelIdSchema }
          }
        }
      ])
    }
  }
}
