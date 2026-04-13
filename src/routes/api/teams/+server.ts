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
