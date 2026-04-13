import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/lib/server/schedule-generator.ts
/**
* Generate a scouting schedule.
*
* Groups stay together as units. With activeGroupCount > 1, multiple groups
* are active simultaneously, each covering a slice of the teams in a match.
*
* Example: 3 groups of 2, activeGroupCount=2, shiftLength=10
*  - Matches 1-10: Group 1 scouts teams 1-2, Group 2 scouts teams 3-4
*  - Matches 11-20: Group 2 scouts teams 1-2, Group 3 scouts teams 3-4
*  - Matches 21-30: Group 3 scouts teams 1-2, Group 1 scouts teams 3-4
*  - etc.
*/
function generateSchedule(groups, matches, shiftLength, activeGroupCount = 1) {
	if (groups.length === 0 || matches.length === 0 || shiftLength < 1) return [];
	const activeCount = Math.min(activeGroupCount, groups.length);
	const assignments = [];
	const sorted = [...matches].sort((a, b) => a.match_number - b.match_number);
	const memberIndex = {};
	for (const g of groups) memberIndex[g.id] = 0;
	for (let i = 0; i < sorted.length; i++) {
		const match = sorted[i];
		const shiftIndex = Math.floor(i / shiftLength);
		const activeGroups = [];
		for (let a = 0; a < activeCount; a++) {
			const gIdx = (shiftIndex + a) % groups.length;
			activeGroups.push(groups[gIdx]);
		}
		const teams = [
			match.red1,
			match.red2,
			match.blue1,
			match.blue2
		].filter((t) => t !== null && t !== void 0);
		if (teams.length === 0) continue;
		const teamsPerGroup = Math.ceil(teams.length / activeCount);
		let teamIdx = 0;
		for (const group of activeGroups) {
			if (group.members.length === 0 || teamIdx >= teams.length) continue;
			const groupTeams = teams.slice(teamIdx, teamIdx + teamsPerGroup);
			teamIdx += teamsPerGroup;
			const usedMembers = /* @__PURE__ */ new Set();
			for (const teamNum of groupTeams) {
				if (group.members.length === 0) break;
				let idx = memberIndex[group.id] % group.members.length;
				let attempts = 0;
				while (usedMembers.has(idx) && attempts < group.members.length) {
					memberIndex[group.id]++;
					idx = memberIndex[group.id] % group.members.length;
					attempts++;
				}
				assignments.push({
					match_id: match.id,
					scouter_id: group.members[idx],
					team_number: teamNum,
					group_id: group.id
				});
				usedMembers.add(idx);
				memberIndex[group.id]++;
			}
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
		const { shift_length, group_order, active_groups } = await request.json();
		const groups = [];
		for (const gid of group_order) {
			if (!db.prepare("SELECT * FROM scout_groups WHERE id = ?").get(gid)) continue;
			const members = db.prepare("SELECT scouter_id FROM scout_group_members WHERE group_id = ?").all(gid);
			groups.push({
				id: gid,
				members: members.map((m) => m.scouter_id)
			});
		}
		const assignments = generateSchedule(groups, db.prepare("SELECT * FROM matches ORDER BY match_number").all(), shift_length, active_groups || 1);
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
