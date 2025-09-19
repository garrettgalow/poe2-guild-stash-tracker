import { useState, useEffect } from 'react';
import { useLeague } from '../contexts/league-context';

interface TopUser {
  user: string;
  count: number;
}

export function useTopUsers(action: 'added' | 'removed' | 'modified', timeRange: string, excludeSystemAccounts: boolean, excludeCommunityAccounts: boolean) {
  const [data, setData] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedLeague } = useLeague();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/charts/top-users?action=${action}&timeRange=${timeRange}&excludeSystemAccounts=${excludeSystemAccounts}&excludeCommunityAccounts=${excludeCommunityAccounts}&league=${encodeURIComponent(selectedLeague)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch top users data');
        }
        
        const result = await response.json() as { success: boolean, data: TopUser[], error?: string };
        
        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }
        
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [action, timeRange, excludeSystemAccounts, excludeCommunityAccounts, selectedLeague]);

  return { data, loading, error };
} 