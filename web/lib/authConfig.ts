import type { AuthAppConfig, TenancyMode } from '@wsws/auth/react';

/**
 * Build the auth config from NEXT_PUBLIC_* env vars. Throws at module-load time if
 * required values are missing — fail loudly during dev/CI, not at first login attempt.
 */
function resolveTenancy(): TenancyMode {
  const mode = process.env.NEXT_PUBLIC_AZURE_TENANCY ?? 'multi-tenant';
  switch (mode) {
    case 'multi-tenant':
      return { mode: 'multi-tenant' };
    case 'multi-tenant-and-personal':
      return { mode: 'multi-tenant-and-personal' };
    case 'single-tenant': {
      const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
      if (!tenantId) {
        throw new Error(
          'NEXT_PUBLIC_AZURE_TENANCY=single-tenant requires NEXT_PUBLIC_AZURE_TENANT_ID'
        );
      }
      return { mode: 'single-tenant', tenantId };
    }
    default:
      throw new Error(`Unknown NEXT_PUBLIC_AZURE_TENANCY: ${mode}`);
  }
}

export function getAuthConfig(): AuthAppConfig | null {
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  if (!clientId) return null;

  const apiScope = process.env.NEXT_PUBLIC_API_SCOPE;
  const allowed = process.env.NEXT_PUBLIC_ALLOWED_TENANT_IDS?.split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    clientId,
    tenancy: resolveTenancy(),
    scopes: apiScope ? [apiScope] : ['User.Read'],
    allowedTenantIds: allowed && allowed.length > 0 ? allowed : undefined,
  };
}
