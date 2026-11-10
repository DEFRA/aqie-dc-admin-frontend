export function handleFuelWeightRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/fuel-weight/index', {
    pageTitle: 'Fuel weight',
    backLink: { href: `/review-fuel/${encoded}/fuel-details` }
  })
}

export const fuelWeightController = {
  handler: handleFuelWeightRequest
}
