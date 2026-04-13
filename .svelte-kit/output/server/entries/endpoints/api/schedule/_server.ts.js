import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/lib/server/schedule-generator.ts
function generateSchedule(groups, matches, shiftLength) {
	if (groups.length === 0 || matches.length === 0 || shiftLength < 1) return [];
	const assignments = [];
	const sorted = [...matches].sort((a, b) => a.match_number - b.match_number);
	const memberIndex = {};
	for (const g of groups) memberIndex[g.id] = 0;
	for (let i = 0; i < sorted.length; i++) {
		const match = sorted[i];
		const activeGroup = groups[Math.floor(i / shiftLength) % groups.length];
		if (activeGroup.members.length === 0) continue;
		const teams = [
			match.red1,
			match.red2,
			match.blue1,
			match.blue2
		].filter((t) => t !== null && t !== void 0);
		const usedScouters = /* @__PURE__ */ new Set();
		const count = Math.min(teams.length, activeGroup.members.length);
		for (let t = 0; t < count; t++) {
			let idx = memberIndex[activeGroup.id] % activeGroup.members.length;
			let attempts = 0;
			while (usedScouters.has(activeGroup.members[idx]) && attempts < activeGroup.members.length) {
				memberIndex[activeGroup.id]++;
				idx = memberIndex[activeGroup.id] % activeGroup.members.length;
				attempts++;
			}
			assignments.push({
				match_id: match.id,
				scouter_id: activeGroup.members[idx],
				team_number: teams[t],
				group_id: activeGroup.id
			});
			usedScouters.add(activeGroup.members[idx]);
			memberIndex[activeGroup.id]++;
		}
	}
	return assignments;
}
//#endregion
//#region src/routes/api/schedule/+server.ts
function GET() {
	return json(db.prepare(`
    SELECT sa.*, m.match_number, t.name as team_name, s.name as scouter_name, g.name as group_name
    FROM shift_assignments sa
    JOIN matches m ON sa.match_id = m.id
    JOIN teams t ON sa.team_number = t.number
    JOIN scouters s ON sa.scouter_id = s.id
    JOIN scout_groups g ON sa.group_id = g.id
    ORDER BY m.match_number, sa.id
  `).all());
}
function POST({ request }) {
	return (async () => {
		const { shift_length, group_order } = await request.json();
		const groups = [];
		for (const gid of group_order) {
			if (!db.prepare("SELECT * FROM scout_groups WHERE id = ?").get(gid)) continue;
			const members = db.prepare("SELECT scouter_id FROM scout_group_members WHERE group_id = ?").all(gid);
			groups.push({
				id: gid,
				members: members.map((m) => m.scouter_id)
			});
		}
		const assignments = generateSchedule(groups, db.prepare("SELECT * FROM matches ORDER BY match_number").all(), shift_length);
		db.transaction(() => {
			db.prepare("DELETE FROM shift_assignments").run();
			const insert = db.prepare("INSERT INTO shift_assignments (match_id, scouter_id, team_number, group_id) VALUES (?, ?, ?, ?)");
			for (const a of assignments) insert.run(a.match_id, a.scouter_id, a.team_number, a.group_id);
		})();
		return json({
			success: true,
			assignments: assignments.length
		});
	})();
}
function DELETE() {
	db.prepare("DELETE FROM shift_assignments").run();
	return json({ success: true });
}
//#endregion
export { DELETE, GET, POST };
