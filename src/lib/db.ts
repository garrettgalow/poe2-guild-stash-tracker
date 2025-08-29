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
  excludeSystemUsers?: boolean,
  league?: string
) {
  let timeFilter = '';
  let accountFilter = '';
  let leagueFilter = '';
  let actionFilter = '';
  
  if (timeRange) {
    switch (timeRange) {
      case '24h':
        timeFilter = "WHERE date > datetime('now', '-1 day')";
        break;
      case '7d':
        timeFilter = "WHERE date > datetime('now', '-7 days')";
        break;
      case '14d':
        timeFilter = "WHERE date > datetime('now', '-14 days')";
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

  if (league) {
    leagueFilter = "league = \"" + league + "\"";
  }

  actionFilter = "action = \"" + action + "\"";
  
  const conditions = [];
  // const params = [];

  if (timeFilter) conditions.push(timeFilter.replace('WHERE', ''));
  if (accountFilter) conditions.push(accountFilter);
  if (leagueFilter) conditions.push(leagueFilter);
  conditions.push(actionFilter);

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  console.log('whereClause', whereClause);
  console.log(db
    .prepare(`
      SELECT account as user, COUNT(*) as count
      FROM stash_events
      ${whereClause}
      GROUP BY account
      ORDER BY count DESC
      LIMIT 10
    `))

  return db
    .prepare(`
      SELECT account as user, COUNT(*) as count
      FROM stash_events
      ${whereClause}
      GROUP BY account
      ORDER BY count DESC
      LIMIT 10
    `)
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
  excludeSystemUsers?: boolean,
  league?: string
) {
  let timeFilter = '';
  let accountFilter = '';
  let leagueFilter = '';
  
  if (timeRange) {
    switch (timeRange) {
      case '24h':
        timeFilter = "WHERE date > datetime('now', '-1 day')";
        break;
      case '7d':
        timeFilter = "WHERE date > datetime('now', '-7 days')";
        break;
      case '14d':
        timeFilter = "WHERE date > datetime('now', '-14 days')";
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

  if (league) {
    leagueFilter = "league = \"" + league + "\"";
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

  const conditions = [];
  if (timeFilter) conditions.push(timeFilter.replace('WHERE', ''));
  if (accountFilter) conditions.push(accountFilter);
  if (leagueFilter) conditions.push(leagueFilter);

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  return db
    .prepare(`
      WITH user_actions AS (
        SELECT 
          account,
          SUM(CASE WHEN action = 'added' THEN itemCount ELSE 0 END) as additions,
          SUM(CASE WHEN action = 'removed' THEN itemCount ELSE 0 END) as removals
        FROM stash_events
        ${whereClause}
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
  excludeSystemUsers: boolean,
  league?: string
) {
  let timeFilter = '';
  let groupFormat = '';
  let accountFilter = '';
  let leagueFilter = '';
  
  // Set time filter based on selected range
  switch (timeRange) {
    case '24h':
      timeFilter = "WHERE date > datetime('now', '-1 day')";
      break;
    case '7d':
      timeFilter = "WHERE date > datetime('now', '-7 days')";
      break;
    case '14d':
      timeFilter = "WHERE date > datetime('now', '-14 days')";
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

  if (league) {
    leagueFilter = "league = \"" + league + "\"";
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
      groupFormat = "%Y-%W";
      break;
    case 'month':
      groupFormat = "%Y-%m";
      break;
  }

  const conditions = [];
  if (timeFilter) conditions.push(timeFilter.replace('WHERE', ''));
  if (accountFilter) conditions.push(accountFilter);
  if (leagueFilter) conditions.push(leagueFilter);

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  
  return db
    .prepare(`
      SELECT 
        strftime('${groupFormat}', date) as time_segment,
        SUM(CASE WHEN action = 'added' THEN 1 ELSE 0 END) as added,
        SUM(CASE WHEN action = 'removed' THEN 1 ELSE 0 END) as removed,
        SUM(CASE WHEN action = 'modified' THEN 1 ELSE 0 END) as modified
      FROM stash_events
      ${whereClause}
      GROUP BY time_segment
      ORDER BY time_segment ASC
    `)
    .all();
}

export async function getAccountStats(db: D1Database, account: string, league: string, dateRange: string = 'all') {
  const dateFilter = getDateFilter(dateRange);
  
  // Create the list of currency tabs for the SQL query
  const currencyTabsList = config.currencyTabs.map(tab => `'${tab}'`).join(',');
  
  const query = `
    WITH filtered_transactions AS (
      SELECT 
        account,
        item,
        action,
        itemCount,
        date,
        op_id,
        stash
      FROM stash_events
      WHERE account = ? 
      AND league = ?
      ${dateFilter}
    ),
    currency_transactions AS (
      SELECT 
        item,
        action,
        itemCount,
        date,
        op_id
      FROM filtered_transactions
      WHERE item IN (SELECT item_name FROM item_category_mapping WHERE category_id = 1)
      AND stash IN (${currencyTabsList})
    ),
    currency_totals AS (
      SELECT 
        item,
        SUM(CASE WHEN action = 'added' THEN itemCount ELSE 0 END) as total_added,
        SUM(CASE WHEN action = 'removed' THEN itemCount ELSE 0 END) as total_removed,
        SUM(CASE 
          WHEN action = 'added' THEN itemCount 
          WHEN action = 'removed' THEN -itemCount 
          ELSE 0 
        END) as final_balance
      FROM currency_transactions
      GROUP BY item
    ),
    gem_totals AS (
      SELECT 
        SUM(CASE WHEN action = 'added' THEN itemCount ELSE 0 END) as gems_added,
        SUM(CASE WHEN action = 'removed' THEN itemCount ELSE 0 END) as gems_removed
      FROM filtered_transactions
      WHERE item IN (SELECT item_name FROM item_category_mapping WHERE category_id = 2)
      AND action IN ('added', 'removed')
    ),
    other_totals AS (
      SELECT 
        SUM(CASE WHEN action = 'added' THEN itemCount ELSE 0 END) as other_added,
        SUM(CASE WHEN action = 'removed' THEN itemCount ELSE 0 END) as other_removed
      FROM filtered_transactions
      WHERE item NOT IN (SELECT item_name FROM item_category_mapping)
      AND action IN ('added', 'removed')
    ),
    currency_summary AS (
      SELECT 
        json_group_object(
          item,
          json_object(
            'added', total_added,
            'removed', total_removed,
            'balance', final_balance
          )
        ) as currency_details,
        SUM(total_added) as total_currency_added,
        SUM(total_removed) as total_currency_removed
      FROM currency_totals
    )
    SELECT 
      (SELECT currency_details FROM currency_summary) as currency_details,
      (SELECT total_currency_added FROM currency_summary) as total_currency_added,
      (SELECT total_currency_removed FROM currency_summary) as total_currency_removed,
      (SELECT gems_added FROM gem_totals) as gems_added,
      (SELECT gems_removed FROM gem_totals) as gems_removed,
      (SELECT other_added FROM other_totals) as other_added,
      (SELECT other_removed FROM other_totals) as other_removed,
      (SELECT total_currency_added FROM currency_summary) + 
        COALESCE((SELECT gems_added FROM gem_totals), 0) + 
        COALESCE((SELECT other_added FROM other_totals), 0) as total_added,
      (SELECT total_currency_removed FROM currency_summary) + 
        COALESCE((SELECT gems_removed FROM gem_totals), 0) + 
        COALESCE((SELECT other_removed FROM other_totals), 0) as total_removed
    FROM (SELECT 1)
  `;

  const result = await db.prepare(query).bind(account, league).first();
  
  if (!result) {
    return null;
  }

  return {
    totalAdded: result.total_added,
    totalRemoved: result.total_removed,
    currency: JSON.parse(result.currency_details as string),
    gems: {
      added: result.gems_added || 0,
      removed: result.gems_removed || 0
    },
    other: {
      added: result.other_added || 0,
      removed: result.other_removed || 0
    }
  };
}

// Helper function to get date filter based on range
function getDateFilter(range: string): string {
  const now = new Date();
  switch (range) {
    case '24h':
      return `AND date >= datetime('now', '-1 day')`;
    case '7d':
      return `AND date >= datetime('now', '-7 days')`;
    case '14d':
      return `AND date >= datetime('now', '-14 days')`;
    case '30d':
      return `AND date >= datetime('now', '-30 days')`;
    default:
      return '';
  }
}
