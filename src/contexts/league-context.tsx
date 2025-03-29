import React, { createContext, useContext, useState, ReactNode } from 'react';
import { config } from '../lib/config';

interface LeagueContextType {
  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [selectedLeague, setSelectedLeague] = useState(config.leagueList[0]);

  return (
    <LeagueContext.Provider value={{ selectedLeague, setSelectedLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
} 