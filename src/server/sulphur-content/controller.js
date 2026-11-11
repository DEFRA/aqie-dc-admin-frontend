export function handleFuelDescriptionSulphurContentRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('sulphur-content/index', {
    pageTitle: 'Sulphur content',
    backLink: { href: `/review-fuel/${encoded}/fuel-description` }
  })
}

export const sulphurContentController = {
  handler: handleFuelDescriptionSulphurContentRequest
}
