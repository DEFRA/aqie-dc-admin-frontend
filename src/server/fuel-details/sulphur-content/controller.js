export function handleSulphurContentRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)
  const returnPage =
    request.query.returnTo === 'fuel-description'
      ? 'fuel-description'
      : 'fuel-details'

  return h.view('fuel-details/sulphur-content/index', {
    pageTitle: 'Sulphur content',
    backLink: { href: `/review-fuel/${encoded}/${returnPage}` }
  })
}

export const sulphurContentController = {
  handler: handleSulphurContentRequest
}
