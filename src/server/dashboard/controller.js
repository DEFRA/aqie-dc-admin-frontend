import { dashboardContent } from './content.js'

function handleDashboard(_request, h) {
  return h.view('dashboard/index', {
    pageTitle: 'Dashboard',
    applianceNewCount: 1,
    fuelNewCount: 2,
    applianceInProgressCount: 2,
    fuelInProgressCount: 3,
    applianceTotalRecordCount: 4,
    fuelTotalRecordCount: 5,

    heading: dashboardContent.en.heading
  })
}

export const dashboardController = {
  handler: handleDashboard
}
export { handleDashboard }
