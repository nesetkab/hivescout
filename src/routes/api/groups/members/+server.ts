import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function POST({ request }) {
  return (async () => {
    const { group_id, scouter_id } = await request.json();
    // Remove from any other group first
    db.prepare('DELETE FROM scout_group_members WHERE scouter_id = ?').run(scouter_id);
    db.prepare('INSERT INTO scout_group_members (group_id, scouter_id) VALUES (?, ?)').run(group_id, scouter_id);
    return json({ success: true });
  })();
}

export function DELETE({ request }) {
  return (async () => {
    const { group_id, scouter_id } = await request.json();
    db.prepare('DELETE FROM scout_group_members WHERE group_id = ? AND scouter_id = ?').run(group_id, scouter_id);
    return json({ success: true });
  })();
}
