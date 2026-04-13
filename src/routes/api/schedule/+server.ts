import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { generateSchedule } from '$lib/server/schedule-generator';

export function GET() {
  const assignments = db.prepare(`
    SELECT sa.*, m.match_number, t.name as team_name, s.name as scouter_name, g.name as group_name
    FROM shift_assignments sa
    JOIN matches m ON sa.match_id = m.id
    JOIN teams t ON sa.team_number = t.number
    JOIN scouters s ON sa.scouter_id = s.id
    JOIN scout_groups g ON sa.group_id = g.id
    ORDER BY m.match_number, sa.id
  `).all();
  return json(assignments);
}

export function POST({ request }) {
  return (async () => {
    const { shift_length, group_order } = await request.json();

    // Load groups in specified order with their members
    const groups = [];
    for (const gid of group_order) {
      const group = db.prepare('SELECT * FROM scout_groups WHERE id = ?').get(gid) as any;
      if (!group) continue;
      const members = db.prepare('SELECT scouter_id FROM scout_group_members WHERE group_id = ?').all(gid) as any[];
      groups.push({ id: gid, members: members.map((m: any) => m.scouter_id) });
    }

    // Load all matches
    const matches = db.prepare('SELECT * FROM matches ORDER BY match_number').all() as any[];

    const assignments = generateSchedule(groups, matches, shift_length);

    // Clear old schedule and insert new
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM shift_assignments').run();
      const insert = db.prepare(
        'INSERT INTO shift_assignments (match_id, scouter_id, team_number, group_id) VALUES (?, ?, ?, ?)'
      );
      for (const a of assignments) {
        insert.run(a.match_id, a.scouter_id, a.team_number, a.group_id);
      }
    });
    tx();

    return json({ success: true, assignments: assignments.length });
  })();
}

export function DELETE() {
  db.prepare('DELETE FROM shift_assignments').run();
  return json({ success: true });
}
