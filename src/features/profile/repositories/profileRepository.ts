import type { Profile, ProfileChanges } from '../domain/profile'

export interface ProfileRepository {
  getProfile: (userId: string) => Promise<Profile>
  updateProfile: (userId: string, changes: ProfileChanges) => Promise<Profile>
}
