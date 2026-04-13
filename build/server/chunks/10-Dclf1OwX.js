import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D6i7RNL1.js')).default;
const server_id = "src/routes/manager/scouts/+page.server.ts";
const imports = ["_app/immutable/nodes/10.BnJENlhP.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/10.QeLlBQdx.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=10-Dclf1OwX.js.map
