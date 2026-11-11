export function handleFuelDescriptionFuelCompositionRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-composition/index', {
    pageTitle: 'Fuel composition',
    backLink: { href: `/review-fuel/${encoded}/fuel-description` }
  })
}

export const fuelCompositionController = {
  handler: handleFuelDescriptionFuelCompositionRequest
}
