import Joi from 'joi'
import { applianceRecordTestReportsController } from './controller.js'

const paramsSchema = Joi.object({
  applianceId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const applianceRecordTestReports = {
  plugin: {
    name: 'applianceRecordTestReports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/appliance-record/{applianceId}/test-reports',
          ...applianceRecordTestReportsController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
