import { D1Database } from '@cloudflare/workers-types';
import { StashEvent } from './types';
import { config }from './config';

export async function insertEvents(db: D1Database, events: Partial<StashEvent>[]) {
  const results = await db.batch(
    events.map((event) =>
      db
        .prepare(
          `INSERT INTO stash_events (date, op_id, league, account, action, stash, itemCount,item) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(op_id) DO NOTHING`
        )
        .bind(
          event.date,
          event.op_id,
          event.league,
          event.account,
          event.action,
          event.stash,
          event.itemCount,
          event.item
        )
    )
  );

  // console.log('First result structure:', JSON.stringify(results[0]));
  // console.log('written rows:', results[0].meta.changes);
  // console.log('written rows:', results[1].meta.changes);

  const newCount = results.reduce((count, result) => {
    return count + (result.meta.changes ?? 0);
  }, 0);

  return {
    total: events.length,
    duplicates: events.length - newCount,
    inserted: newCount
  };
}

export async function getTableData(
  db: D1Database,
  {
    account,
    action,
    stash,
    itemCount,
    item,
    league,
    page = 1,
    pageSize = 10
  }: {
    account?: string;
    action?: 'added' | 'removed' | 'modified' | 'all';
    stash?: string;
    item?: string;
    itemCount?: number;
    league?: string;
    page?: number;
    pageSize?: number;
  }
) {
  // Build dynamic WHERE clause based on provided filters
  const conditions = [];
  const params = [];

  if (account) {
    conditions.push("account LIKE ?");
    params.push(`%${account}%`);
  }
  
  if (action && action !== 'all') {
    conditions.push("action = ?");
    params.push(action);
  }
  
  if (stash) {
    conditions.push("stash LIKE ?");
    params.push(`%${stash}%`);
  }
  
  if (item) {
    conditions.push("item LIKE ?");
    params.push(`%${item}%`);
  }
  
  if (league) {
    conditions.push("league LIKE ?");
    params.push(`%${league}%`);
  }
  
  // Construct the WHERE clause
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(" AND ")}` 
    : "";
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;
  
  // Add pagination parameters
  params.push(pageSize);
  params.push(offset);
  
  // Get paginated data
  const dataResult = await db
    .prepare(
      `
      SELECT date, op_id, league, account, action, stash, itemCount, item
      FROM stash_events 
      ${whereClause}
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
      `
    )
    .bind(...params)
    .all();
    
  // Clone the params array without pagination parameters for the count query
  const countParams = [...params];
  countParams.pop(); // Remove offset
  countParams.pop(); // Remove limit
  
  // Get total count for pagination
  const countResult = await db
    .prepare(
      `
      SELECT COUNT(*) as total
      FROM stash_events 
      ${whereClause}
      `
    )
    .bind(...countParams)
    .first();
    
  return {
    data: dataResult.results,
    pagination: {
      total: countResult?.total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((countResult?.total || 0) as number / pageSize)
    }
  };
}

export async function getTopUsers(
  db: D1Database,
  action: 'added' | 'removed' | 'modified',
  timeRange?: string,
  excludeSystemUsers?: boolean
) {
  let timeFilter = '';
  let accountFilter = '';
  
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

  if (excludeSystemUsers) {
    accountFilter = "account not in (\"" + config.systemAccounts.join('","') + "\")";
  }

  return db
    .prepare(`
      SELECT account as user, COUNT(*) as count
      FROM stash_events
      ${timeFilter ? timeFilter : ''}
      ${timeFilter ? 'AND' : 'WHERE'}
      ${accountFilter ? accountFilter : ''}
      ${accountFilter ? 'AND' : ''} action = ?
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

export async function getUserRatios(
  db: D1Database,
  timeRange?: string,
  limit?: number,
  order?: string,
  excludeSystemUsers?: boolean
) {
  let timeFilter = '';
  let accountFilter = '';
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

  if (excludeSystemUsers) {
    accountFilter = "account not in (\"" + config.systemAccounts.join('","') + "\")";
  }

  if (order) {
    switch (order) {
      case 'asc':
        order = 'ASC';
        break;
      case 'desc':
        order = 'DESC';
        break;
      default:
        order = 'DESC';
        break;
    }
  }
  console.log('timeFilter', timeFilter);
  console.log('accountFilter', accountFilter);
  return db
    .prepare(`
      WITH user_actions AS (
        SELECT 
          account,
          SUM(CASE WHEN action = 'added' THEN 1 ELSE 0 END) as additions,
          SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removals
        FROM stash_events
        ${timeFilter ? timeFilter : ''}
        ${accountFilter ? 'AND' : ''}
        ${accountFilter ? accountFilter : ''}
        GROUP BY account
        HAVING additions > 0 OR removals > 0
      )
      SELECT 
        account as user, 
        additions, 
        removals,
        additions - removals as ratio
      FROM user_actions
      ORDER BY ratio ${order}
      LIMIT ?
    `)
    .bind(limit)
    .all();
}

export async function getActivityByTimeSegment(
  db: D1Database,
  timeRange: string,
  timeSlice: string,
  excludeSystemUsers: boolean
) {
  let timeFilter = '';
  let groupFormat = '';
  let accountFilter = '';
  
  // Set time filter based on selected range
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

  if (excludeSystemUsers) {
    accountFilter = "account not in (\"" + config.systemAccounts.join('","') + "\")";
  }
  
  // Set grouping format based on time slice
  switch (timeSlice) {
    case 'hour':
      groupFormat = "%Y-%m-%d %H:00";
      break;
    case 'day':
      groupFormat = "%Y-%m-%d";
      break;
    case 'week':
      // SQLite doesn't have a direct week format, so we'll use a workaround
      groupFormat = "%Y-%W";
      break;
    case 'month':
      groupFormat = "%Y-%m";
      break;
  }
  
  return db
    .prepare(`
      SELECT 
        strftime('${groupFormat}', date) as time_segment,
        SUM(CASE WHEN action = 'added' THEN 1 ELSE 0 END) as added,
        SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removed,
        SUM(CASE WHEN action = 'modified' THEN 1 ELSE 0 END) as modified
      FROM stash_events
      ${timeFilter}
      ${accountFilter ? 'AND' : ''}
      ${accountFilter ? accountFilter : ''}
      GROUP BY time_segment
      ORDER BY time_segment ASC
    `)
    .all();
}
