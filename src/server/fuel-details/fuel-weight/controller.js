export function handleFuelWeightRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)
  const returnPage =
    request.query.returnTo === 'fuel-description'
      ? 'fuel-description'
      : 'fuel-details'

  return h.view('fuel-details/fuel-weight/index', {
    pageTitle: 'Fuel weight',
    backLink: { href: `/review-fuel/${encoded}/${returnPage}` }
  })
}

export const fuelWeightController = {
  handler: handleFuelWeightRequest
}
