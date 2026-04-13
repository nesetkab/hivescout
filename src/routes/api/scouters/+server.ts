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

export function DELETE({ request }) {
  return (async () => {
    const { id } = await request.json();
    if (!id) return json({ error: 'id required' }, { status: 400 });
    db.prepare('DELETE FROM scout_group_members WHERE scouter_id = ?').run(id);
    db.prepare('DELETE FROM scouter_assignments WHERE scouter_id = ?').run(id);
    db.prepare('DELETE FROM shift_assignments WHERE scouter_id = ?').run(id);
    db.prepare('DELETE FROM match_scouts WHERE scouter_id = ?').run(id);
    db.prepare('DELETE FROM prescout_responses WHERE scouter_id = ?').run(id);
    db.prepare('DELETE FROM scouters WHERE id = ?').run(id);
    return json({ success: true });
  })();
}
