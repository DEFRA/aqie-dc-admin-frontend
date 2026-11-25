import Joi from 'joi'
import {
  applianceReviewController,
  applianceDecisionController,
  legacyApplianceRedirectController
} from './controller.js'
import { incompleteReviewController } from './incomplete-review-controller.js'

/**
 * Sets up the routes used in the /review-appliance page.
 * These routes are registered in src/server/router.js.
 */

const applicationIdSchema = {
  applicationId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
}

const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

const nestedParamsSchema = applianceIdSchema.keys(applicationIdSchema)

const basePath =
  '/review-appliance-application/{applicationId}/review-appliance/{applianceId}'

export const reviewAppliance = {
  plugin: {
    name: 'reviewAppliance',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: basePath,
          ...applianceReviewController,
          options: {
            validate: { params: nestedParamsSchema }
          }
        },
        {
          method: 'GET',
          path: `${basePath}/incomplete-review`,
          ...incompleteReviewController,
          options: {
            validate: { params: nestedParamsSchema }
          }
        },
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}',
          ...legacyApplianceRedirectController,
          options: {
            validate: { params: applianceIdSchema }
          }
        },
        {
          method: 'POST',
          path: basePath,
          ...applianceDecisionController,
          options: {
            validate: {
              params: nestedParamsSchema,
              payload: Joi.object({
                decision: Joi.string().valid('accept', 'reject').required()
              })
            }
          }
        }
      ])
    }
  }
}
