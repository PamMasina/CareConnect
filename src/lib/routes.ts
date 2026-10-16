import type { Role } from './types'

/**
 * Landing page for each role once signed in.
 * Mirrors the role workspaces configured in components/Layout.tsx.
 */
export function homePathForRole(role: Role | null | undefined): string {
  switch (role) {
    case 'doctor':
    case 'nurse':
      return '/staff'
    case 'first_responder':
      return '/sos-inbox'
    case 'admin':
      return '/admin'
    case 'patient':
    default:
      return '/my-appointments'
  }
}
