import db from '$lib/server/db';

export function load({ url }) {
  const name = url.searchParams.get('name') || 'Unknown';
  let scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get(name) as any;
  if (!scouter) {
    db.prepare('INSERT INTO scouters (name) VALUES (?)').run(name);
    scouter = db.prepare('SELECT * FROM scouters WHERE name = ?').get(name);
  }
  const teams = db.prepare('SELECT * FROM teams ORDER BY number').all();

  const myPrescouts = scouter
    ? db.prepare(`
        SELECT p.*, t.name as team_name
        FROM prescout_responses p
        JOIN teams t ON p.team_number = t.number
        WHERE p.scouter_id = ?
        ORDER BY p.created_at DESC
      `).all(scouter.id)
    : [];

  return { scouter, teams, myPrescouts };
}
