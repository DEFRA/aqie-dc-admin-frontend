export function handleFuelCompositionRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)
  const returnPage =
    request.query.returnTo === 'fuel-description'
      ? 'fuel-description'
      : 'fuel-details'

  return h.view('fuel-details/fuel-composition/index', {
    pageTitle: 'Fuel composition',
    backLink: { href: `/review-fuel/${encoded}/${returnPage}` }
  })
}

export const fuelCompositionController = {
  handler: handleFuelCompositionRequest
}
