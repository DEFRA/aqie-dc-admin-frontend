import Joi from 'joi'
import {
  handleInstructionManualRequest,
  handleInstructionManualDecisionRequest
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

const payloadSchema = Joi.object({
  action: Joi.string().valid('passed', 'failed').required(),

  title: Joi.string().allow('').optional(),

  includeVersion: Joi.string().valid('yes', 'no', '').allow('').optional(),

  version: Joi.string().allow('').optional(),

  publicationDay: Joi.string().allow('').optional(),

  publicationMonth: Joi.string().allow('').optional(),

  publicationYear: Joi.string().allow('').optional()
})

export const instructionManual = {
  plugin: {
    name: 'instructionManual',

    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/instruction-manual',
          handler: handleInstructionManualRequest,
          options: {
            validate: {
              params: paramsSchema
            }
          }
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/instruction-manual',
          handler: handleInstructionManualDecisionRequest,
          options: {
            validate: {
              params: paramsSchema,
              payload: payloadSchema
            }
          }
        }
      ])
    }
  }
}
