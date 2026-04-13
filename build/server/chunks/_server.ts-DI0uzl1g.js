import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/groups/+server.ts
function GET() {
	return json(db.prepare(`
    SELECT g.*, GROUP_CONCAT(gm.scouter_id) as member_ids,
      GROUP_CONCAT(s.name) as member_names
    FROM scout_groups g
    LEFT JOIN scout_group_members gm ON g.id = gm.group_id
    LEFT JOIN scouters s ON gm.scouter_id = s.id
    GROUP BY g.id
    ORDER BY g.sort_order, g.id
  `).all());
}
function POST({ request }) {
	return (async () => {
		const { name } = await request.json();
		const count = db.prepare("SELECT COUNT(*) as c FROM scout_groups").get().c;
		return json({ id: db.prepare("INSERT INTO scout_groups (name, sort_order) VALUES (?, ?)").run(name, count).lastInsertRowid });
	})();
}
function DELETE({ request }) {
	return (async () => {
		const { id } = await request.json();
		db.prepare("DELETE FROM scout_group_members WHERE group_id = ?").run(id);
		db.prepare("DELETE FROM shift_assignments WHERE group_id = ?").run(id);
		db.prepare("DELETE FROM scout_groups WHERE id = ?").run(id);
		return json({ success: true });
	})();
}

export { DELETE, GET, POST };
//# sourceMappingURL=_server.ts-DI0uzl1g.js.map
