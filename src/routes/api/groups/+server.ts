import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET() {
  const groups = db.prepare(`
    SELECT g.*, GROUP_CONCAT(gm.scouter_id) as member_ids,
      GROUP_CONCAT(s.name) as member_names
    FROM scout_groups g
    LEFT JOIN scout_group_members gm ON g.id = gm.group_id
    LEFT JOIN scouters s ON gm.scouter_id = s.id
    GROUP BY g.id
    ORDER BY g.sort_order, g.id
  `).all();
  return json(groups);
}

export function POST({ request }) {
  return (async () => {
    const { name } = await request.json();
    const count = (db.prepare('SELECT COUNT(*) as c FROM scout_groups').get() as any).c;
    const result = db.prepare('INSERT INTO scout_groups (name, sort_order) VALUES (?, ?)').run(name, count);
    return json({ id: result.lastInsertRowid });
  })();
}

export function DELETE({ request }) {
  return (async () => {
    const { id } = await request.json();
    db.prepare('DELETE FROM scout_group_members WHERE group_id = ?').run(id);
    db.prepare('DELETE FROM shift_assignments WHERE group_id = ?').run(id);
    db.prepare('DELETE FROM scout_groups WHERE id = ?').run(id);
    return json({ success: true });
  })();
}
