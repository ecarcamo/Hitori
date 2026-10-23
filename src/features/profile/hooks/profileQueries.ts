import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { ProfileChanges } from '../domain/profile'
import type { ProfileRepository } from '../repositories/profileRepository'

export function profileQueryOptions(repository: ProfileRepository, userId: string) {
  return queryOptions({
    queryKey: ['profile', userId],
    queryFn: () => repository.getProfile(userId),
  })
}

export function useProfile(repository: ProfileRepository, userId: string) {
  return useSuspenseQuery(profileQueryOptions(repository, userId)).data
}

export function useUpdateProfile(repository: ProfileRepository, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: ProfileChanges) => repository.updateProfile(userId, changes),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryOptions(repository, userId).queryKey, profile)
    },
  })
}
