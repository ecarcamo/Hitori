import type { Database } from '@/shared/lib/database.types'
import type { AppSupabaseClient } from '@/shared/lib/supabase'
import type { Profile, ProfileChanges } from '../domain/profile'
import type { ProfileRepository } from './profileRepository'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

const PROFILE_COLUMNS = 'id, display_name, timezone, onboarded_at, max_in_progress, urgency_days'

function toProfile(
  row: Pick<
    ProfileRow,
    'id' | 'display_name' | 'timezone' | 'onboarded_at' | 'max_in_progress' | 'urgency_days'
  >,
) {
  return {
    id: row.id,
    displayName: row.display_name,
    timezone: row.timezone,
    onboardedAt: row.onboarded_at,
    maxInProgress: row.max_in_progress,
    urgencyDays: row.urgency_days,
  } satisfies Profile
}

function toProfileUpdate(changes: ProfileChanges): ProfileUpdate {
  return {
    ...(changes.displayName !== undefined ? { display_name: changes.displayName } : {}),
    ...(changes.timezone !== undefined ? { timezone: changes.timezone } : {}),
    ...(changes.onboardedAt !== undefined ? { onboarded_at: changes.onboardedAt } : {}),
  }
}

export function createSupabaseProfileRepository(client: AppSupabaseClient): ProfileRepository {
  return {
    async getProfile(userId) {
      const { data, error } = await client
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .single()
      if (error) {
        throw new Error('No se pudo cargar tu perfil.', { cause: error })
      }
      return toProfile(data)
    },
    async updateProfile(userId, changes) {
      const { data, error } = await client
        .from('profiles')
        .update(toProfileUpdate(changes))
        .eq('id', userId)
        .select(PROFILE_COLUMNS)
        .single()
      if (error) {
        throw new Error('No se pudieron guardar los cambios.', { cause: error })
      }
      return toProfile(data)
    },
  }
}
