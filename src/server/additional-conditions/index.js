import Joi from 'joi'
import {
  handleAdditionalConditionsRequest,
  handleAdditionalConditionsDecisionRequest
} from './controller.js'

// Route parameters are restricted to the same appliance identifier format used
// elsewhere in the review screens so the URL remains safe and consistent.
const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const additionalConditions = {
  plugin: {
    name: 'additionalConditions',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/additional-conditions',
          handler: handleAdditionalConditionsRequest,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/additional-conditions',
          handler: handleAdditionalConditionsDecisionRequest,
          options: {
            validate: {
              params: paramsSchema,
              // the free-text value is optional because null/empty input is
              // handled explicitly as a validation error in the controller.
              payload: Joi.object({
                additionalConditions: Joi.string().allow('').optional()
              })
            }
          }
        }
      ])
    }
  }
}
