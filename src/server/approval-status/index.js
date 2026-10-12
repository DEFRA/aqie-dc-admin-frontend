import Joi from 'joi'
import {
  approvalsStatusController,
  approvalsStatusDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/),
  country: Joi.string()
    .required()
    .valid('england', 'scotland', 'wales', 'northern-ireland')
})

export const approvalStatus = {
  plugin: {
    name: 'approvalStatus',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/approval-status-{country}',
          ...approvalsStatusController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/appliance-record/{applianceId}/approval-status-{country}',
          ...approvalsStatusDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                decision: Joi.string()
                  .valid('yes', 'no', 'certified', 'uncertified')
                  .required()
              })
            }
          }
        }
      ])
    }
  }
}
