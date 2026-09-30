import Joi from 'joi'
import { getTestReports, postTestReports } from './controller.js'

/**
 * Routes for the test-reports technical review screen.
 * Registered from src/server/router.js and validated by a strict appliance ID schema.
 */

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const testReports = {
  plugin: {
    name: 'test-reports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/test-reports',
          handler: getTestReports,
          options: { validate: { params: applianceIdSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/test-reports',
          handler: postTestReports,
          options: {
            validate: {
              params: applianceIdSchema,
              payload: Joi.object({
                action: Joi.string().valid('passed', 'failed').required(),
                ratedOutput: Joi.string().allow('').optional(),
                testedOutputRated: Joi.string().allow('').optional(),
                testedOutputLow: Joi.string().allow('').optional(),
                smokeEmissionOutputRated: Joi.string().allow('').optional(),
                smokeEmissionOutputLow: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
