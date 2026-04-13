import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C6kMKMPI.js')).default;
const server_id = "src/routes/manager/setup/+page.server.ts";
const imports = ["_app/immutable/nodes/11.DdG67Qg8.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/11.B60VFYtO.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=11-BRRxsFU2.js.map
