import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET({ url }) {
  const division = url.searchParams.get('division') || 'default';
  const teams = db.prepare('SELECT * FROM teams WHERE division = ? ORDER BY number').all(division);
  return json(teams);
}

export function POST({ request }) {
  return (async () => {
    const { number, name, division } = await request.json();
    db.prepare('INSERT OR REPLACE INTO teams (number, name, division) VALUES (?, ?, ?)').run(number, name, division || 'default');
    return json({ success: true });
  })();
}

export function DELETE() {
  db.prepare('DELETE FROM shift_assignments').run();
  db.prepare('DELETE FROM scouter_assignments').run();
  db.prepare('DELETE FROM match_scouts').run();
  db.prepare('DELETE FROM prescout_responses').run();
  db.prepare('DELETE FROM matches').run();
  db.prepare('DELETE FROM teams').run();
  return json({ success: true });
}
