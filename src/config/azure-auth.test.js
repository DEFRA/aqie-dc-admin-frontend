import { vi } from 'vitest'
import { msalClient, msalConfig } from './azure-auth.js'
import { ConfidentialClientApplication } from '@azure/msal-node'

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

vi.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: vi.fn()
}))
vi.mock('./config.js', () => ({
  config: {
    get: vi.fn(
      (key) =>
        ({
          'azure.clientId': 'client-abc',
          'azure.authorityHost': 'https://login.microsoftonline.com',
          'azure.tenantId': 'tenant-xyz',
          'azure.clientSecret': 'secret-123'
        })[key] ?? ''
    )
  }
}))
vi.mock('../server/common/helpers/logging/logger.js', () => ({
  createLogger: () => mockLogger
}))

describe('#msalConfig', () => {
  test('Should build the auth config from the Azure config values', () => {
    expect(msalConfig.auth.clientId).toBe('client-abc')
    expect(msalConfig.auth.authority).toBe(
      'https://login.microsoftonline.com/tenant-xyz'
    )
    expect(msalConfig.auth.clientSecret).toBe('secret-123')
  })

  test('Should route MSAL SDK logs through the pino logger, not console', () => {
    msalConfig.system.loggerOptions.loggerCallback('Info', 'msal message')
    expect(mockLogger.debug).toHaveBeenCalledWith('msal message')
  })
})

describe('#msalClient', () => {
  test('Should lazily construct a single ConfidentialClientApplication (singleton)', () => {
    const first = msalClient()
    const second = msalClient()
    expect(first).toBe(second)
    expect(ConfidentialClientApplication).toHaveBeenCalledTimes(1)
    expect(ConfidentialClientApplication).toHaveBeenCalledWith(msalConfig)
  })
})
