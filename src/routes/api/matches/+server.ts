import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET({ url }) {
  const division = url.searchParams.get('division') || 'default';
  const matches = db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    WHERE m.division = ?
    ORDER BY m.match_number
  `).all(division);
  return json(matches);
}

export function POST({ request }) {
  return (async () => {
    const { match_number, division, red1, red2, blue1, blue2, scheduled_time } = await request.json();
    const result = db.prepare(
      'INSERT INTO matches (match_number, division, red1, red2, blue1, blue2, scheduled_time) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(match_number, division || 'default', red1, red2, blue1, blue2, scheduled_time || null);
    return json({ id: result.lastInsertRowid });
  })();
}

export function DELETE() {
  db.prepare('DELETE FROM match_scouts').run();
  db.prepare('DELETE FROM matches').run();
  return json({ success: true });
}
