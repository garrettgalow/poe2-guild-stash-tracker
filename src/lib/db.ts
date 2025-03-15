import { D1Database } from '@cloudflare/workers-types';
import { StashEvent } from './types';

export async function insertEvents(db: D1Database, events: Partial<StashEvent>[]) {
  const results = await db.batch(
    events.map((event) =>
      db
        .prepare(
          `INSERT INTO stash_events (date, op_id, league, account, action, stash, item) 
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(op_id) DO UPDATE SET id=id RETURNING 
           CASE WHEN changes() = 0 THEN 1 ELSE 0 END as duplicate`
        )
        .bind(
          event.date,
          event.op_id,
          event.league,
          event.account,
          event.action,
          event.stash,
          event.item
        )
    )
  );

  const changedCount = results.reduce((count, result) => {
    console.log(result.meta);
    return count + (result.meta?.changes ?? 0);
  }, 0);

  return {
    total: events.length,
    duplicates: results.length - changedCount,
    inserted: results.length
  };
}

export async function getTableData(
  db: D1Database,
  // action: 'added' | 'removed',
  limit = 10
) {
  return db
    .prepare(
      `
    SELECT date, op_id, league, account, action, stash, item
    FROM stash_events 
    ORDER BY date DESC 
    LIMIT ?
  `
    )
    .bind(limit)
    .all();
}

export async function getTopUsers(
  db: D1Database,
  action: 'added' | 'removed' | 'modified',
  timeRange?: string
) {
  let timeFilter = '';
  
  if (timeRange) {
    switch (timeRange) {
      case '24h':
        timeFilter = "WHERE date > datetime('now', '-1 day')";
        break;
      case '7d':
        timeFilter = "WHERE date > datetime('now', '-7 days')";
        break;
      case '30d':
        timeFilter = "WHERE date > datetime('now', '-30 days')";
        break;
      case '90d':
        timeFilter = "WHERE date > datetime('now', '-90 days')";
        break;
    }
  }

  return db
    .prepare(`
      SELECT account as user, COUNT(*) as count
      FROM stash_events
      ${timeFilter ? timeFilter : ''}
      ${timeFilter ? 'AND' : 'WHERE'} action = ?
      GROUP BY account
      ORDER BY count DESC
      LIMIT 10
    `)
    .bind(action)
    .all();
}

export async function getItemsByHour(
  db: D1Database,
  // minutes: number = 60
) {
  return db
    .prepare(`
      SELECT 
        strftime('%Y-%m-%d %H:%M', date) as hour,
        COUNT(*) as count
      FROM stash_events
      WHERE date > datetime('now', '-30 days') 
      GROUP BY hour
      ORDER BY hour ASC
    `)
    // .bind(minutes)
    .all();
}
