import { config } from './config.js'

describe('#config', () => {
  describe('auth', () => {
    test('Should enable SSO by default (fail-secure, no reliance on NODE_ENV)', () => {
      expect(config.default('auth.ssoEnabled')).toBe(true)
    })

    test('Should provide the dev bypass user from config with sensible defaults', () => {
      expect(config.default('auth.devUser.id')).toBe('local-dev')
      expect(config.default('auth.devUser.email')).toBe('dev@yopmail.com')
      expect(config.default('auth.devUser.name')).toBe('Local developer')
    })
  })

  describe('azure', () => {
    test('Should default the authority host to the Microsoft public cloud', () => {
      expect(config.default('azure.authorityHost')).toBe(
        'https://login.microsoftonline.com'
      )
    })
  })
})
