import { t as db } from "../../../../chunks/db.js";
//#region src/routes/manager/scouts/+page.server.ts
function load() {
	return {
		scouts: db.prepare(`
    SELECT ms.*, m.match_number, s.name as scouter_name, t.name as team_name
    FROM match_scouts ms
    JOIN matches m ON ms.match_id = m.id
    JOIN scouters s ON ms.scouter_id = s.id
    JOIN teams t ON ms.team_number = t.number
    ORDER BY m.match_number DESC, ms.id DESC
  `).all(),
		teams: db.prepare("SELECT number, name FROM teams ORDER BY number").all()
	};
}
//#endregion
export { load };
