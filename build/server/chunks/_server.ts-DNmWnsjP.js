import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/prescout/+server.ts
function GET({ url }) {
	const team = url.searchParams.get("team");
	if (team) return json(db.prepare(`
      SELECT p.*, s.name as scouter_name
      FROM prescout_responses p
      JOIN scouters s ON p.scouter_id = s.id
      WHERE p.team_number = ?
      ORDER BY p.created_at DESC
    `).all(Number(team)));
	return json(db.prepare(`
    SELECT p.*, s.name as scouter_name, t.name as team_name
    FROM prescout_responses p
    JOIN scouters s ON p.scouter_id = s.id
    JOIN teams t ON p.team_number = t.number
    ORDER BY p.created_at DESC
  `).all());
}
function POST({ request }) {
	return (async () => {
		const data = await request.json();
		return json({ id: db.prepare(`
      INSERT INTO prescout_responses (team_number, scouter_id, drivetrain, intake_type, can_score_goal, can_classify, can_open_gate, auto_capabilities, teleop_capabilities, endgame_capabilities, strengths, weaknesses, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.team_number, data.scouter_id, data.drivetrain, data.intake_type || null, data.can_score_goal || 0, data.can_classify || 0, data.can_open_gate || 0, data.auto_capabilities, data.teleop_capabilities, data.endgame_capabilities, data.strengths, data.weaknesses, data.notes).lastInsertRowid });
	})();
}

export { GET, POST };
//# sourceMappingURL=_server.ts-DNmWnsjP.js.map
