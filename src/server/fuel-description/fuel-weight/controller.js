export function handleFuelDescriptionFuelWeightRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-description/fuel-weight/index', {
    pageTitle: 'Fuel weight',
    backLink: { href: `/review-fuel/${encoded}/fuel-description` }
  })
}

export const fuelDescriptionFuelWeightController = {
  handler: handleFuelDescriptionFuelWeightRequest
}
