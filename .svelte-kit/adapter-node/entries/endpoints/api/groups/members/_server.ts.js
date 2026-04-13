import { t as db } from "../../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
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
//#endregion
export { DELETE, POST };
