import { t as db } from "../../../../chunks/db.js";
//#region src/routes/scout/match/+page.server.ts
function load({ url }) {
	const name = url.searchParams.get("name") || "Unknown";
	let scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get(name);
	if (!scouter) {
		db.prepare("INSERT INTO scouters (name) VALUES (?)").run(name);
		scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get(name);
	}
	const matches = db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    ORDER BY m.match_number
  `).all();
	const teams = db.prepare("SELECT * FROM teams ORDER BY number").all();
	const schedule = db.prepare(`
    SELECT sa.*, m.match_number, m.id as match_id, t.name as team_name
    FROM shift_assignments sa
    JOIN matches m ON sa.match_id = m.id
    JOIN teams t ON sa.team_number = t.number
    WHERE sa.scouter_id = ?
    ORDER BY m.match_number
  `).all(scouter.id);
	const scoutedMatchIds = db.prepare("SELECT DISTINCT match_id FROM match_scouts WHERE scouter_id = ?").all(scouter.id).map((r) => r.match_id);
	return {
		scouter,
		matches,
		teams,
		schedule,
		scoutedMatchIds
	};
}
//#endregion
export { load };
