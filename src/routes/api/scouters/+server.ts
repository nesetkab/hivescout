import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET() {
  const scouters = db.prepare(`
    SELECT s.*,
      GROUP_CONCAT(sa.team_number) as assigned_teams
    FROM scouters s
    LEFT JOIN scouter_assignments sa ON s.id = sa.scouter_id
    GROUP BY s.id
    ORDER BY s.name
  `).all();
  return json(scouters);
}

export function POST({ request }) {
  return (async () => {
    const { name, role } = await request.json();
    try {
      const result = db.prepare('INSERT INTO scouters (name, role) VALUES (?, ?)').run(name, role || 'scouter');
      return json({ id: result.lastInsertRowid });
    } catch {
      const existing = db.prepare('SELECT * FROM scouters WHERE name = ?').get(name);
      return json(existing);
    }
  })();
}
