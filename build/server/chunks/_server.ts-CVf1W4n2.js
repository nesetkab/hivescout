import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/groups/members/+server.ts
function POST({ request }) {
	return (async () => {
		const { group_id, scouter_id } = await request.json();
		db.prepare("DELETE FROM scout_group_members WHERE scouter_id = ?").run(scouter_id);
		db.prepare("INSERT INTO scout_group_members (group_id, scouter_id) VALUES (?, ?)").run(group_id, scouter_id);
		return json({ success: true });
	})();
}
function DELETE({ request }) {
	return (async () => {
		const { group_id, scouter_id } = await request.json();
		db.prepare("DELETE FROM scout_group_members WHERE group_id = ? AND scouter_id = ?").run(group_id, scouter_id);
		return json({ success: true });
	})();
}

export { DELETE, POST };
//# sourceMappingURL=_server.ts-CVf1W4n2.js.map
