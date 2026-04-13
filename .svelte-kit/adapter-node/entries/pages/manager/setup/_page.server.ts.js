import { t as db } from "../../../../chunks/db.js";
//#region src/routes/manager/setup/+page.server.ts
function load() {
	return {
		teams: db.prepare("SELECT * FROM teams ORDER BY number").all(),
		matches: db.prepare(`
    SELECT m.*,
      t1.name as red1_name, t2.name as red2_name,
      t3.name as blue1_name, t4.name as blue2_name
    FROM matches m
    LEFT JOIN teams t1 ON m.red1 = t1.number
    LEFT JOIN teams t2 ON m.red2 = t2.number
    LEFT JOIN teams t3 ON m.blue1 = t3.number
    LEFT JOIN teams t4 ON m.blue2 = t4.number
    ORDER BY m.match_number
  `).all()
	};
}
//#endregion
export { load };
