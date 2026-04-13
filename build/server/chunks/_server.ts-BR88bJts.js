import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/scouters/assign/+server.ts
function POST({ request }) {
	return (async () => {
		const { scouter_id, team_number } = await request.json();
		try {
			db.prepare("INSERT INTO scouter_assignments (scouter_id, team_number) VALUES (?, ?)").run(scouter_id, team_number);
			return json({ success: true });
		} catch {
			return json({
				success: false,
				error: "Already assigned"
			}, { status: 409 });
		}
	})();
}
function DELETE({ request }) {
	return (async () => {
		const { scouter_id, team_number } = await request.json();
		db.prepare("DELETE FROM scouter_assignments WHERE scouter_id = ? AND team_number = ?").run(scouter_id, team_number);
		return json({ success: true });
	})();
}

export { DELETE, POST };
//# sourceMappingURL=_server.ts-BR88bJts.js.map
