import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
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
function DELETE({ request }) {
	return (async () => {
		const { id } = await request.json();
		if (!id) return json({ error: "id required" }, { status: 400 });
		db.prepare("DELETE FROM scout_group_members WHERE scouter_id = ?").run(id);
		db.prepare("DELETE FROM scouter_assignments WHERE scouter_id = ?").run(id);
		db.prepare("DELETE FROM shift_assignments WHERE scouter_id = ?").run(id);
		db.prepare("DELETE FROM match_scouts WHERE scouter_id = ?").run(id);
		db.prepare("DELETE FROM prescout_responses WHERE scouter_id = ?").run(id);
		db.prepare("DELETE FROM scouters WHERE id = ?").run(id);
		return json({ success: true });
	})();
}
//#endregion
export { DELETE, GET, POST };
