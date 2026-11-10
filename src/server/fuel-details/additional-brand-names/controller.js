export function handleAdditionalBrandNamesRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)
  const returnPage =
    request.query.returnTo === 'fuel-description'
      ? 'fuel-description'
      : 'fuel-details'

  return h.view('fuel-details/additional-brand-names/index', {
    pageTitle: 'Additional brand names',
    backLink: { href: `/review-fuel/${encoded}/${returnPage}` }
  })
}

export const additionalBrandNamesController = {
  handler: handleAdditionalBrandNamesRequest
}
