import db from '$lib/server/db';

export function load({ url }) {
  const name = url.searchParams.get('name') || 'Unknown';

  // Ensure scouter exists
  let scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get(name) as any;
  if (!scouter) {
    db.prepare('INSERT INTO scouters (name) VALUES (?)').run(name);
    scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get(name);
  }

  const matches = db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    ORDER BY m.match_number
  `).all();

  const teams = db.prepare('SELECT * FROM teams ORDER BY number').all();

  const assignments = db.prepare(`
    SELECT sa.team_number, t.name as team_name
    FROM scouter_assignments sa
    JOIN teams t ON sa.team_number = t.number
    WHERE sa.scouter_id = ?
  `).all((scouter as any).id);

  // Shift schedule for this scouter
  const schedule = db.prepare(`
    SELECT sa.*, m.match_number, m.scheduled_time, m.status,
      t.name as team_name, g.name as group_name
    FROM shift_assignments sa
    JOIN matches m ON sa.match_id = m.id
    JOIN teams t ON sa.team_number = t.number
    JOIN scout_groups g ON sa.group_id = g.id
    WHERE sa.scouter_id = ?
    ORDER BY m.match_number
  `).all((scouter as any).id);

  // Get the scouter's group info
  const groupInfo = db.prepare(`
    SELECT g.name as group_name, g.id as group_id
    FROM scout_group_members gm
    JOIN scout_groups g ON gm.group_id = g.id
    WHERE gm.scouter_id = ?
  `).get((scouter as any).id) as any;

  // Figure out total match count for break detection
  const totalMatches = db.prepare('SELECT COUNT(*) as c FROM matches').get() as any;
  const allMatchNumbers = db.prepare('SELECT match_number FROM matches ORDER BY match_number').all() as any[];

  // Already scouted match IDs
  const scoutedMatchIds = db.prepare(
    'SELECT DISTINCT match_id FROM match_scouts WHERE scouter_id = ?'
  ).all((scouter as any).id).map((r: any) => r.match_id);

  return {
    scouter,
    matches,
    teams,
    assignments,
    schedule,
    groupInfo,
    totalMatchCount: totalMatches.c,
    allMatchNumbers: allMatchNumbers.map((m: any) => m.match_number),
    scoutedMatchIds,
  };
}
