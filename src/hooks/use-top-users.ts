import { useState, useEffect } from 'react';

interface TopUser {
  user: string;
  count: number;
}

export function useTopUsers(action: 'added' | 'removed' | 'modified', timeRange: string, excludeSystemAccounts: boolean) {
  const [data, setData] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/charts/top-users?action=${action}&timeRange=${timeRange}&excludeSystemAccounts=${excludeSystemAccounts}`);
        
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
  }, [action, timeRange, excludeSystemAccounts]);

  return { data, loading, error };
} 