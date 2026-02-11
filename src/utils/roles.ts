import { User } from '../types/types'

/**
 * Sjekker om brukeren har en av de angitte rollene.
 * Sjekker både globale roller (user.roles) og gruppe-spesifikke roller (user.group_roles).
 */
export const hasAnyRole = (user: User | null | undefined, roleTitles: string[]): boolean => {
    if (!user) return false

    const normalizedTitles = roleTitles.map((t) => t.toLowerCase())

    const hasGlobalRole = user.roles?.some((role) => normalizedTitles.includes(role.title?.toLowerCase())) ?? false

    const hasGroupRole = user.group_roles?.some((gr) => normalizedTitles.includes(gr.role?.title?.toLowerCase())) ?? false

    return hasGlobalRole || hasGroupRole
}

/**
 * Sjekker om brukeren har en av de angitte rollene i et spesifikt vaktlag.
 */
export const hasRoleInGroup = (user: User | null | undefined, groupId: string, roleTitles: string[]): boolean => {
    if (!user || !groupId) return false

    const normalizedTitles = roleTitles.map((t) => t.toLowerCase())

    return user.group_roles?.some((gr) => gr.group_id === groupId && normalizedTitles.includes(gr.role?.title?.toLowerCase())) ?? false
}

/**
 * Sjekker om brukeren har en global rolle (ikke gruppe-spesifikk).
 */
export const hasGlobalRole = (user: User | null | undefined, roleTitles: string[]): boolean => {
    if (!user) return false

    const normalizedTitles = roleTitles.map((t) => t.toLowerCase())

    return user.roles?.some((role) => normalizedTitles.includes(role.title?.toLowerCase())) ?? false
}

/**
 * Standard roller for tilgangskontroll
 */
export const ADMIN_ROLES = ['bdm', 'admin']
export const LEADER_ROLES = ['vakthaver', 'vaktsjef', 'personalleder', 'leveranseleder']
export const ALL_ACCESS_ROLES = [...ADMIN_ROLES, ...LEADER_ROLES]
