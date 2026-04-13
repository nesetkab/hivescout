import { t as db } from "../../../chunks/db.js";
//#region src/routes/manager/+page.server.ts
function load() {
	const teams = db.prepare("SELECT * FROM teams ORDER BY number").all();
	const matches = db.prepare("SELECT * FROM matches ORDER BY match_number").all();
	const scouters = db.prepare("SELECT * FROM scouters").all();
	const matchScoutCount = db.prepare("SELECT COUNT(*) as c FROM match_scouts").get().c;
	const prescoutCount = db.prepare("SELECT COUNT(*) as c FROM prescout_responses").get().c;
	const recentScouts = db.prepare(`
    SELECT ms.*, s.name as scouter_name, t.name as team_name,
      m.match_number, m.score_red, m.score_blue,
      m.red1, m.red2, m.blue1, m.blue2
    FROM match_scouts ms
    JOIN scouters s ON ms.scouter_id = s.id
    JOIN teams t ON ms.team_number = t.number
    JOIN matches m ON ms.match_id = m.id
    ORDER BY ms.created_at DESC
    LIMIT 10
  `).all();
	return {
		teams,
		teamCount: teams.length,
		matchCount: matches.length,
		scouterCount: scouters.length,
		matchScoutCount,
		prescoutCount,
		recentScouts
	};
}
//#endregion
export { load };
