import db from '$lib/server/db';

export function load() {
  const scouters = db.prepare(`
    SELECT s.*,
      COUNT(DISTINCT ms.id) as scout_count,
      gm.group_id,
      g.name as group_name
    FROM scouters s
    LEFT JOIN match_scouts ms ON s.id = ms.scouter_id
    LEFT JOIN scout_group_members gm ON s.id = gm.scouter_id
    LEFT JOIN scout_groups g ON gm.group_id = g.id
    GROUP BY s.id
    ORDER BY s.name
  `).all();

  const teams = db.prepare('SELECT * FROM teams ORDER BY number').all();

  const groups = db.prepare(`
    SELECT g.*
    FROM scout_groups g
    ORDER BY g.sort_order, g.id
  `).all() as any[];

  const groupMembers = db.prepare(`
    SELECT gm.*, s.name as scouter_name
    FROM scout_group_members gm
    JOIN scouters s ON gm.scouter_id = s.id
    ORDER BY s.name
  `).all() as any[];

  let assignmentCount = 0;
  try { assignmentCount = (db.prepare('SELECT COUNT(*) as c FROM shift_assignments').get() as any).c; } catch {}

  // Get schedule preview (first 20 matches)
  let schedulePreview: any[] = [];
  try {
    schedulePreview = db.prepare(`
      SELECT sa.*, m.match_number, s.name as scouter_name, g.name as group_name, t.name as team_name
      FROM shift_assignments sa
      JOIN matches m ON sa.match_id = m.id
      JOIN scouters s ON sa.scouter_id = s.id
      JOIN scout_groups g ON sa.group_id = g.id
      LEFT JOIN teams t ON sa.team_number = t.number
      ORDER BY m.match_number, sa.id
    `).all();
  } catch {}

  return { scouters, teams, groups, groupMembers, assignmentCount, schedulePreview };
}
