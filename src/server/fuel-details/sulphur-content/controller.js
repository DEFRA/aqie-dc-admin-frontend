export function handleSulphurContentRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/sulphur-content/index', {
    pageTitle: 'Sulphur content',
    backLink: { href: `/review-fuel/${encoded}/fuel-details` }
  })
}

export const sulphurContentController = {
  handler: handleSulphurContentRequest
}
