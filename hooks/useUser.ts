import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/types/user'

export function useUser() {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  return {
    user,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
  }
}
