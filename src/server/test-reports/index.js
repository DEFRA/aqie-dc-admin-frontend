import { getTestReports, postTestReports } from './controller.js'

export const testReports = {
  plugin: {
    name: 'test-reports',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-appliance/{applianceId}/test-reports',
          handler: getTestReports
        },
        {
          method: 'POST',
          path: '/review-appliance/{applianceId}/test-reports',
          handler: postTestReports
        }
      ])
    }
  }
}
