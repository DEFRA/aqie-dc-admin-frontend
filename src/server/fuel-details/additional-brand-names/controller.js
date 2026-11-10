export function handleAdditionalBrandNamesRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/additional-brand-names/index', {
    pageTitle: 'Additional brand names',
    backLink: { href: `/review-fuel/${encoded}/fuel-details` }
  })
}

export const additionalBrandNamesController = {
  handler: handleAdditionalBrandNamesRequest
}
