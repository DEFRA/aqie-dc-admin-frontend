import { sessionCache } from './session-cache.js'

describe('#sessionCache', () => {
  test('Should set the yar cookie to SameSite=Lax so OAuth state survives the redirect', () => {
    expect(sessionCache.options.cookieOptions.isSameSite).toBe('Lax')
  })
})
