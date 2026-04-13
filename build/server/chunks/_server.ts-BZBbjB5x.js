import { d as db } from './db-Cl30lYRM.js';
import { json } from '@sveltejs/kit';
import 'better-sqlite3';
import 'path';

//#region src/routes/api/matchscout/+server.ts
function GET({ url }) {
	const team = url.searchParams.get("team");
	const match_id = url.searchParams.get("match");
	if (team) return json(db.prepare(`
      SELECT ms.*, s.name as scouter_name, m.match_number
      FROM match_scouts ms
      JOIN scouters s ON ms.scouter_id = s.id
      JOIN matches m ON ms.match_id = m.id
      WHERE ms.team_number = ?
      ORDER BY m.match_number
    `).all(Number(team)));
	if (match_id) return json(db.prepare(`
      SELECT ms.*, s.name as scouter_name, t.name as team_name
      FROM match_scouts ms
      JOIN scouters s ON ms.scouter_id = s.id
      JOIN teams t ON ms.team_number = t.number
      WHERE ms.match_id = ?
    `).all(Number(match_id)));
	return json(db.prepare(`
    SELECT ms.*, s.name as scouter_name, t.name as team_name, m.match_number
    FROM match_scouts ms
    JOIN scouters s ON ms.scouter_id = s.id
    JOIN teams t ON ms.team_number = t.number
    JOIN matches m ON ms.match_id = m.id
    ORDER BY m.match_number DESC
  `).all());
}
function POST({ request }) {
	return (async () => {
		const d = await request.json();
		return json({ id: db.prepare(`
      INSERT INTO match_scouts (
        match_id, team_number, scouter_id,
        auto_leave, auto_classified, auto_overflow, auto_pattern_matches,
        teleop_classified, teleop_overflow, teleop_depot, teleop_pattern_matches,
        opened_gate, endgame_base,
        defense_rating, driver_skill, reliability,
        minor_fouls, major_fouls, yellow_card, red_card,
        notes, scoring_events, started_at, ended_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(d.match_id, d.team_number, d.scouter_id, d.auto_leave || 0, d.auto_classified || 0, d.auto_overflow || 0, d.auto_pattern_matches || 0, d.teleop_classified || 0, d.teleop_overflow || 0, d.teleop_depot || 0, d.teleop_pattern_matches || 0, d.opened_gate || 0, d.endgame_base || "none", d.defense_rating || 0, d.driver_skill || 0, d.reliability || 0, d.minor_fouls || 0, d.major_fouls || 0, d.yellow_card || 0, d.red_card || 0, d.notes || "", JSON.stringify(d.scoring_events || []), d.started_at || null, d.ended_at || null).lastInsertRowid });
	})();
}
function PATCH({ request }) {
	return (async () => {
		const { id, ...fields } = await request.json();
		if (!id) return json({ error: "id required" }, { status: 400 });
		const allowed = [
			"auto_leave",
			"auto_classified",
			"auto_overflow",
			"teleop_classified",
			"teleop_overflow",
			"opened_gate",
			"endgame_base",
			"defense_rating",
			"driver_skill",
			"reliability",
			"notes"
		];
		const sets = [];
		const vals = [];
		for (const [k, v] of Object.entries(fields)) if (allowed.includes(k)) {
			sets.push(`${k} = ?`);
			vals.push(v);
		}
		if (sets.length === 0) return json({ error: "No valid fields" }, { status: 400 });
		vals.push(id);
		db.prepare(`UPDATE match_scouts SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
		return json({ success: true });
	})();
}
function DELETE({ request }) {
	return (async () => {
		const { id } = await request.json();
		if (!id) return json({ error: "id required" }, { status: 400 });
		db.prepare("DELETE FROM match_scouts WHERE id = ?").run(id);
		return json({ success: true });
	})();
}

export { DELETE, GET, PATCH, POST };
//# sourceMappingURL=_server.ts-BZBbjB5x.js.map
