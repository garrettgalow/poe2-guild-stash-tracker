import { Hono } from 'hono';
import { parse } from 'csv-parse/sync';
import { Env } from './lib/types';
import { insertEvents, getTopUsers, getItemsByHour, getTableData, getUserRatios, getActivityByTimeSegment } from './lib/db';
import { StashEvent } from './lib/types';

const app = new Hono<{ Bindings: Env }>();

// API routes first
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const content = await file.text();

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      cast_date: false
    }) as any[];

    console.log('Raw record sample:', JSON.stringify(records[0], null, 2));

    // Before the filter, define the type for cleaned records
    interface CleanedRecord {
      date: string;
      op_id: number;
      league: string;
      account: string;
      action: string;
      stash: string;
      item: string;
    }

    const cleanedRecords = records.map((record, index) => {
      try {
        // Handle the BOM character in the Date field name
        const dateValue = record['﻿Date'] || record.Date;
        const idValue = record.Id;
        
        if (!dateValue || !idValue || !record.League || !record.Account || !record.Action || !record.Stash || !record.Item) {
          console.error(`Missing required fields in record ${index}:`, record);
          return null;
        }

        return {
          date: String(dateValue).replace(/['"]/g, '').trim(),
          op_id: parseInt(String(idValue), 10),
          league: String(record.League).replace(/['"]/g, '').trim(),
          account: String(record.Account).replace(/['"]/g, '').trim(),
          action: String(record.Action).replace(/['"]/g, '').trim().toLowerCase(),
          stash: String(record.Stash).replace(/['"]/g, '').trim(),
          item: String(record.Item).replace(/['"]/g, '').trim()
        };
      } catch (err) {
        console.error(`Error processing record ${index}:`, err, record);
        return null;
      }
    }).filter((record): record is CleanedRecord => record !== null);

    console.log('Cleaned Records Sample:', cleanedRecords.slice(0, 2));

    const validRecords = cleanedRecords.filter(record => {
      const isValid = (
        record.date &&
        record.op_id &&
        record.league &&
        record.account &&
        record.stash &&
        record.item &&
        (record.action === 'added' || record.action === 'removed' || record.action === 'modified')
      );

      if (!isValid) {
        console.log('Invalid Record:', {
          record,
          missingFields: {
            date: !record.date,
            op_id: !record.op_id,
            league: !record.league,
            account: !record.account,
            stash: !record.stash,
            item: !record.item,
            action: !(record.action === 'added' || record.action === 'removed' || record.action === 'modified')
          }
        });
      }
      return isValid;
    });

    if (validRecords.length === 0) {
      return c.json({ 
        error: 'No valid records found in CSV',
        recordCount: records.length,
        sampleRecord: records[0],
        cleanedSampleRecord: cleanedRecords[0]
      }, 400);
    }

    const insertResult = await insertEvents(c.env.DB, validRecords as Partial<StashEvent>[]);

    const invalidRecords = records.filter(record => {
      const matchingValid = validRecords.find(valid => 
        valid.op_id === parseInt(String(record.Id), 10)
      );
      return !matchingValid;
    }).slice(0, 10).map(record => ({
      record,
      issues: {
        date: !record.Date,
        op_id: !record.Id,
        league: !record.League,
        account: !record.Account,
        stash: !record.Stash,
        item: !record.Item,
        action: !(record.Action?.toLowerCase() === 'added' || record.Action?.toLowerCase() === 'removed' || record.Action?.toLowerCase() === 'modified')
      }
    }));

    return c.json({ 
      success: true, 
      count: validRecords.length,
      inserted: insertResult.inserted,
      duplicates: insertResult.duplicates,
      invalid: records.length - validRecords.length,
      invalidSamples: invalidRecords,
      sampleValidRecord: validRecords[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// API routes before static file handling
app.get('/api/charts/top-users', async (c) => {
  const action = c.req.query('action') as 'added' | 'removed' | 'modified' || 'added';
  const timeRange = c.req.query('timeRange') || '7d';
  
  // Validate action parameter
  if (!['added', 'removed', 'modified'].includes(action)) {
    return c.json({ error: 'Invalid action parameter' }, 400);
  }
  
  try {
    const result = await getTopUsers(c.env.DB, action, timeRange as string);
    
    return c.json({
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching top users:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch top users data' 
    }, 500);
  }
});

app.get('/api/charts/items-by-hour', async (c) => {
  const minutes = Number(c.req.query('minutes')) || 60;
  const results = await getItemsByHour(c.env.DB);
  
  return c.json({
    labels: results.results.map(r => r.hour),
    datasets: [{
      label: 'Items per Hour',
      data: results.results.map(r => r.count),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });
});

app.get('/api/stash-data', async (c) => {
  const limit = Number(c.req.query('limit')) || 10;
  const results = await getTableData(c.env.DB, limit);
  
  return c.json({
    success: true,
    data: results.results
  });
});

app.get('/api/charts/user-ratios', async (c) => {
  const timeRange = c.req.query('timeRange') || '7d';
  const limit = Number(c.req.query('limit')) || 10;
  const order = c.req.query('order') || 'desc';
  try {
    const result = await getUserRatios(c.env.DB, timeRange as string, limit, order as string);

    return c.json({
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching user ratios:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch user ratios data' 
    }, 500);
  }
});

app.get('/api/charts/activity', async (c) => {
  const timeRange = c.req.query('timeRange') || '7d';
  const timeSlice = c.req.query('timeSlice') || 'day';
  
  try {
    const result = await getActivityByTimeSegment(c.env.DB, timeRange as string, timeSlice as string);
    
    return c.json({
      success: true,
      data: result.results
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch activity data' 
    }, 500);
  }
});

// Serve static files for all other routes
app.all('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
