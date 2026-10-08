import Joi from 'joi'
import { applianceRecordController } from './controller.js'

/**
 * Appliance Record Route Module
 *
 * Defines the Hapi route for the appliance-record page.
 *
 * Route: GET /appliance-record/{applianceId}
 *
 * Parameters:
 * - applianceId: Required string (1-64 chars, alphanumeric + hyphens)
 *   - Trimmed of whitespace
 *   - Pattern validated to prevent injection
 *   - URL-encoded when used in API calls
 *
 * Displays individual appliance record with:
 * - Certification status by country
 * - Related details (appliance, tests, manual, application, history)
 * - Public listing visibility status and toggle buttons
 *
 * Registered in: src/server/router.js
 * Handler: src/server/appliance-record/controller.js handleGetApplianceRecordPage()
 * Template: src/server/appliance-record/index.njk
 * Content: src/server/appliance-record/content.js
 * Data: src/server/appliance-record/appliance-record-data.js
 */

/**
 * Joi schema for appliance-record route parameters.
 * Ensures applianceId is valid before handler execution.
 */
const applianceIdSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const applianceRecord = {
  plugin: {
    name: 'applianceRecord',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}',
          ...applianceRecordController,
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
