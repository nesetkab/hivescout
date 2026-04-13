import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/notes/+server.ts
function GET({ url }) {
	const q = url.searchParams.get("q") || "";
	const team = url.searchParams.get("team");
	let query = `
    SELECT ms.notes, ms.team_number, ms.created_at,
      m.match_number, s.name as scouter_name, t.name as team_name,
      ms.endgame_base, ms.auto_leave, ms.opened_gate
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
    JOIN scouters s ON ms.scouter_id = s.id
    JOIN teams t ON ms.team_number = t.number
    WHERE ms.notes IS NOT NULL AND ms.notes != ''
  `;
	const params = [];
	if (q.trim()) {
		query += ` AND ms.notes LIKE ?`;
		params.push(`%${q.trim()}%`);
	}
	if (team) {
		query += ` AND ms.team_number = ?`;
		params.push(Number(team));
	}
	query += ` ORDER BY ms.created_at DESC LIMIT 100`;
	const results = db.prepare(query).all(...params);
	let prescoutResults = [];
	if (q.trim() || team) {
		let pq = `
      SELECT p.*, s.name as scouter_name, t.name as team_name
      FROM prescout_responses p
      JOIN scouters s ON p.scouter_id = s.id
      JOIN teams t ON p.team_number = t.number
      WHERE 1=1
    `;
		const pp = [];
		if (q.trim()) {
			pq += ` AND (p.notes LIKE ? OR p.strengths LIKE ? OR p.weaknesses LIKE ? OR p.auto_capabilities LIKE ? OR p.teleop_capabilities LIKE ? OR p.endgame_capabilities LIKE ?)`;
			for (let i = 0; i < 6; i++) pp.push(`%${q.trim()}%`);
		}
		if (team) {
			pq += ` AND p.team_number = ?`;
			pp.push(Number(team));
		}
		pq += ` ORDER BY p.created_at DESC LIMIT 50`;
		prescoutResults = db.prepare(pq).all(...pp);
	}
	return json({
		matchNotes: results,
		prescoutNotes: prescoutResults
	});
}
//#endregion
export { GET };
