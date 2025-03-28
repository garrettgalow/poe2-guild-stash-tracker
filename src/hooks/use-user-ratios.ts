import { useState, useEffect } from 'react';

interface UserRatio {
  user: string;
  additions: number;
  removals: number;
  ratio: number;
}

export function useUserRatios(timeRange: string, limit: number, order: string, excludeSystemAccounts: boolean) {
  const [data, setData] = useState<UserRatio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/charts/user-ratios?timeRange=${timeRange}&limit=${limit}&order=${order}&excludeSystemAccounts=${excludeSystemAccounts}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user ratios data');
        }
        
        const result = await response.json() as { success: boolean, data: UserRatio[], error?: string };
        
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
  }, [timeRange, excludeSystemAccounts]);

  return { data, loading, error };
} 