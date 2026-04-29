import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET() {
  const rows = db.prepare(`
    SELECT p.position, p.team_number, p.notes, p.tier, p.updated_at, t.name as team_name
    FROM picklist p
    JOIN teams t ON p.team_number = t.number
    ORDER BY p.position ASC
  `).all();
  return json(rows);
}

export function POST({ request }) {
  return (async () => {
    try {
      const { teams } = await request.json() as {
        teams: { number: number; notes?: string; tier?: string }[];
      };

      if (!Array.isArray(teams)) {
        return json({ error: 'teams must be an array' }, { status: 400 });
      }

      const deleteAll = db.prepare('DELETE FROM picklist');
      const insert = db.prepare(`
        INSERT INTO picklist (position, team_number, notes, tier, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);

      const runTransaction = db.transaction(() => {
        deleteAll.run();
        for (let i = 0; i < teams.length; i++) {
          const t = teams[i];
          insert.run(i + 1, t.number, t.notes || '', t.tier || 'none');
        }
      });

      runTransaction();
      return json({ success: true, count: teams.length });
    } catch (err: any) {
      return json({ error: err.message }, { status: 500 });
    }
  })();
}
