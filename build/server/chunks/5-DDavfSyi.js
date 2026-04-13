import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-kg9FO9w3.js')).default;
const server_id = "src/routes/manager/+page.server.ts";
const imports = ["_app/immutable/nodes/5.crwjJicj.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/5.brjYqr9x.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-DDavfSyi.js.map
