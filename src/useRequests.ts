import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { fetchRequests } from './api';

// Open replacement requests this user can take. Checked again every 30 seconds,
// so a new request reaches the volunteer without refreshing the page.
export function useRequests() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['requests', token],
    queryFn: () => fetchRequests(token!),
    enabled: token !== null,
    refetchInterval: 30_000,
  });
}
