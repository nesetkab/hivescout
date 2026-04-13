import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/matches/+server.ts
function GET({ url }) {
	const division = url.searchParams.get("division") || "default";
	return json(db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    WHERE m.division = ?
    ORDER BY m.match_number
  `).all(division));
}
function POST({ request }) {
	return (async () => {
		const { match_number, division, red1, red2, blue1, blue2, scheduled_time } = await request.json();
		return json({ id: db.prepare("INSERT INTO matches (match_number, division, red1, red2, blue1, blue2, scheduled_time) VALUES (?, ?, ?, ?, ?, ?, ?)").run(match_number, division || "default", red1, red2, blue1, blue2, scheduled_time || null).lastInsertRowid });
	})();
}
function DELETE() {
	db.prepare("DELETE FROM match_scouts").run();
	db.prepare("DELETE FROM matches").run();
	return json({ success: true });
}

export { DELETE, GET, POST };
//# sourceMappingURL=_server.ts-D3rzDfvx.js.map
