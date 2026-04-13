import { d as db } from './db-Cl30lYRM.js';
import 'better-sqlite3';
import 'path';

//#region src/routes/scout/prescout/+page.server.ts
function load({ url }) {
	const name = url.searchParams.get("name") || "Unknown";
	let scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get(name);
	if (!scouter) {
		db.prepare("INSERT INTO scouters (name) VALUES (?)").run(name);
		scouter = db.prepare("SELECT * FROM scouters WHERE name = ?").get(name);
	}
	const teams = db.prepare("SELECT * FROM teams ORDER BY number").all();
	const myPrescouts = scouter ? db.prepare(`
        SELECT p.*, t.name as team_name
        FROM prescout_responses p
        JOIN teams t ON p.team_number = t.number
        WHERE p.scouter_id = ?
        ORDER BY p.created_at DESC
      `).all(scouter.id) : [];
	return {
		scouter,
		teams,
		myPrescouts
	};
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DcVpi4W2.js')).default;
const server_id = "src/routes/scout/prescout/+page.server.ts";
const imports = ["_app/immutable/nodes/14.TUToM6RN.js","_app/immutable/chunks/DYyj0PsP.js","_app/immutable/chunks/BzSQjt5-.js","_app/immutable/chunks/B_xp5TRh.js","_app/immutable/chunks/t62M88qj.js"];
const stylesheets = ["_app/immutable/assets/14.r4u87It3.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-Cms423uo.js.map
