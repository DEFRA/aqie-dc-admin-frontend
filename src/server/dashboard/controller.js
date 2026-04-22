import { dashboardContent } from './content.js'

export const dashboardController = {
  handler(_request, h) {
    return h.view('dashboard/index', {
      pageTitle: 'Dashboard',
      applianceNewCount: 1,
      fuelNewCount: 2,
      applianceInProgressCount: 2,
      fuelInProgressCount: 3,
      applianceTotalRecordCount: 4,
      fuelTotalRecordCount: 5,

      heading: dashboardContent.en.heading,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Dashboard'
        }
      ]
    })
  }
}
