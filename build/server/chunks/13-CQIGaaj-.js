import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CCDdnaYY.js')).default;
const server_id = "src/routes/scout/match/+page.server.ts";
const imports = ["_app/immutable/nodes/13.B7Txtuu4.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js","_app/immutable/chunks/kOwL_V-q.js"];
const stylesheets = ["_app/immutable/assets/13.CxpkB7zE.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-CQIGaaj-.js.map
