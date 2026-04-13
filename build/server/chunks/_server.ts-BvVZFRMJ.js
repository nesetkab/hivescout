import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/scouters/+server.ts
function GET() {
	return json(db.prepare(`
    SELECT s.*,
      GROUP_CONCAT(sa.team_number) as assigned_teams
    FROM scouters s
    LEFT JOIN scouter_assignments sa ON s.id = sa.scouter_id
    GROUP BY s.id
    ORDER BY s.name
  `).all());
}
function POST({ request }) {
	return (async () => {
		const { name, role } = await request.json();
		try {
			return json({ id: db.prepare("INSERT INTO scouters (name, role) VALUES (?, ?)").run(name, role || "scouter").lastInsertRowid });
		} catch {
			return json(db.prepare("SELECT * FROM scouters WHERE name = ?").get(name));
		}
	})();
}

export { GET, POST };
//# sourceMappingURL=_server.ts-BvVZFRMJ.js.map
