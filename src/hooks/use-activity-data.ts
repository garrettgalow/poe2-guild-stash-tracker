import { useState, useEffect } from 'react';
import { useLeague } from '../contexts/league-context';

interface ActivityData {
  time_segment: string;
  added: number;
  removed: number;
  modified: number;
}

export function useActivityData(timeRange: string, timeSlice: string, excludeSystemAccounts: boolean) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedLeague } = useLeague();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/charts/activity?timeRange=${timeRange}&timeSlice=${timeSlice}&excludeSystemAccounts=${excludeSystemAccounts}&league=${encodeURIComponent(selectedLeague)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        
        const result = await response.json() as { success: boolean, data: ActivityData[], error?: string };
        
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
  }, [timeRange, timeSlice, excludeSystemAccounts, selectedLeague]);

  return { data, loading, error };
} 