import { D1Database } from '@cloudflare/workers-types';

export interface StashEvent {
  id?: number;
  date: string;
  op_id: number;
  league: string;
  account: string;
  action: 'added' | 'removed' | 'modified';
  stash: string;
  item: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface Env {
  DB: D1Database;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}
