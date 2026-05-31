// Re-export from the new auth.tsx so existing imports of `useAuth` keep
// working without edits. New code should import from './auth' directly.
export { useAuth, AuthProvider } from './auth';
export type { AuthState, AuthUser } from './auth';
