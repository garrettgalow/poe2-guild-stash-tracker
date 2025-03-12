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

export async function getTopUsers(
  db: D1Database,
  action: 'added' | 'removed',
  limit = 10
) {
  return db
    .prepare(
      `
    SELECT user, COUNT(*) as count 
    FROM stash_events 
    WHERE action = ? 
    GROUP BY user 
    ORDER BY count DESC 
    LIMIT ?
  `
    )
    .bind(action, limit)
    .all();
}

export async function getItemsByMinute(
  db: D1Database,
  // minutes: number = 60
) {
  return db
    .prepare(`
      SELECT 
        strftime('%Y-%m-%d %H:%M', date) as minute,
        COUNT(*) as count
      FROM stash_events
      WHERE date > datetime('now', '-24 hours') 
      GROUP BY minute
      ORDER BY minute ASC
    `)
    // .bind(minutes)
    .all();
}
