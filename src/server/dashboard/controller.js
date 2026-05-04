import { dashboardContent } from './content.js'
import { getCounts } from './dashboard-data.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()

async function handleDashboard(_request, h) {
  try {
    const counts = await getCounts()

    return h.view('dashboard/index', {
      pageTitle: dashboardContent.en.pageTitle,
      heading: dashboardContent.en.heading,
      applianceNewCount: counts.appliance.new,
      fuelNewCount: counts.fuel.new,
      applianceInProgressCount: counts.appliance.inProgress,
      fuelInProgressCount: counts.fuel.inProgress,
      applianceTotalRecordCount: counts.appliance.records,
      fuelTotalRecordCount: counts.fuel.records
    })
  } catch (error) {
    logger.error(`[dashboard.GET] failed:${error.message}`, error)
    return h
      .view('error/index', {
        message: 'Sorry there is a problem with the service'
      })
      .code(statusCodes.internalServerError)
  }
}

export const dashboardController = {
  handler: handleDashboard
}
export { handleDashboard }
